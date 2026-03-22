import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import { Booking } from '../types';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, isSameDay, setHours, setMinutes, startOfDay, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EquipmentCalendarProps {
  equipmentId: string;
  equipmentName: string;
  onBookingCreated: () => void;
}

const EquipmentCalendar: React.FC<EquipmentCalendarProps> = ({ equipmentId, equipmentName, onBookingCreated }) => {
  const { user, isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [, setSelectedSlot] = useState<{ day: Date; hour: number } | null>(null);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
  });

  // Working hours: 9 AM to 6 PM
  const startHour = 9;
  const endHour = 18;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Helper to parse ISO string and keep it in UTC (no timezone conversion)
  // const parseISOasUTC = (isoString: string): Date => {
  //   // parseISO returns a Date object in the user's local timezone
  //   // We need to interpret the time as if it were already in the local timezone
  //   const date = parseISO(isoString);
  //   return date;
  // };

  // Helper to format datetime for datetime-local input (must be in local time format)
  // const formatForInput = (isoString: string): string => {
  //   const date = parseISO(isoString);
  //   return format(date, "yyyy-MM-dd'T'HH:mm");
  // };

  useEffect(() => {
    fetchBookings();
  }, [equipmentId, currentDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

      const response = await bookingsAPI.getAll({
        equipment_id: equipmentId,
        start_date: weekStart.toISOString(),
        end_date: weekEnd.toISOString(),
      });

      // Show both confirmed and pending bookings
      setBookings(response.data.bookings.filter(b => ['confirmed', 'pending'].includes(b.status)));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const isTimeSlotBooked = (day: Date, hour: number) => {
    // Create UTC time strings for the slot
    const slotDateStr = format(day, 'yyyy-MM-dd');
    const slotStartStr = `${slotDateStr}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
    const slotEndStr = `${slotDateStr}T${(hour + 1).toString().padStart(2, '0')}:00:00.000Z`;

    return bookings.some((booking) => {
      // Compare ISO strings directly (they're already in UTC)
      const bookingStart = booking.start_time;
      const bookingEnd = booking.end_time;

      // Check if the slot overlaps with any booking
      return (
        (slotStartStr >= bookingStart && slotStartStr < bookingEnd) ||
        (bookingStart >= slotStartStr && bookingStart < slotEndStr)
      );
    });
  };

  const getBookingForSlot = (day: Date, hour: number) => {
    const slotDateStr = format(day, 'yyyy-MM-dd');
    const slotStartStr = `${slotDateStr}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
    const slotEndStr = `${slotDateStr}T${(hour + 1).toString().padStart(2, '0')}:00:00.000Z`;

    return bookings.find((booking) => {
      const bookingStart = booking.start_time;
      const bookingEnd = booking.end_time;

      return (
        (slotStartStr >= bookingStart && slotStartStr < bookingEnd) ||
        (bookingStart >= slotStartStr && bookingStart < slotEndStr)
      );
    });
  };

  const isFirstSlotOfBooking = (day: Date, hour: number, booking: Booking) => {
    // Extract hour directly from the ISO string (UTC time)
    // booking.start_time is like "2025-11-27T11:00:00.000Z"
    const bookingDateStr = booking.start_time.substring(0, 10); // "2025-11-27"
    const bookingHourStr = booking.start_time.substring(11, 13); // "11"
    const bookingHour = parseInt(bookingHourStr);

    // Get the date string from the slot day
    const slotDateStr = format(day, 'yyyy-MM-dd');

    // Check if this slot's date and hour matches the booking's start date and hour
    return slotDateStr === bookingDateStr && hour === bookingHour;
  };

  const handleTimeSlotClick = (day: Date, hour: number) => {
    const now = new Date();
    const slotStart = setMinutes(setHours(startOfDay(day), hour), 0);

    // Prevent booking in the past
    if (isBefore(slotStart, now)) {
      alert('Cannot book time slots in the past');
      return;
    }

    // Check if slot is already booked
    if (isTimeSlotBooked(day, hour)) {
      const booking = getBookingForSlot(day, hour);
      if (booking) {
        alert(`This time slot is already booked by ${booking.user_name}\nFrom: ${booking.start_time.substring(0, 16).replace('T', ' ')}\nTo: ${booking.end_time.substring(0, 16).replace('T', ' ')}\nPurpose: ${booking.purpose || 'N/A'}`);
      }
      return;
    }

    // Open booking modal with pre-filled start time
    const startTime = setMinutes(setHours(startOfDay(day), hour), 0);
    const endTime = setMinutes(setHours(startOfDay(day), hour + 1), 0);

    setSelectedSlot({ day, hour });
    setBookingForm({
      startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      purpose: '',
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse the datetime-local input values
    // datetime-local gives us a string like "2025-11-27T11:00"
    // We need to treat this as UTC time (lab time) not local time
    const startTimeStr = bookingForm.startTime + ':00.000Z'; // Add seconds and Z for UTC
    const endTimeStr = bookingForm.endTime + ':00.000Z';

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    // Validation
    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    if (isBefore(startTime, new Date())) {
      alert('Cannot book time slots in the past');
      return;
    }

    try {
      if (editingBooking) {
        // Update existing booking
        await bookingsAPI.update(editingBooking.id, {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          purpose: bookingForm.purpose || '',
        });
        alert('Booking updated successfully!');
      } else {
        // Create new booking
        const response = await bookingsAPI.create({
          equipment_id: equipmentId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          purpose: bookingForm.purpose || '',
        });

        // Show appropriate message based on approval requirement
        const requiresApproval = (response.data as any).requires_approval;
        const message = requiresApproval
          ? 'Booking created successfully!\n\n⏳ This equipment requires admin approval.\nYour booking is pending approval.'
          : 'Booking created and confirmed successfully!';

        alert(message);
      }

      await fetchBookings();
      onBookingCreated();
      setShowBookingModal(false);
      setEditingBooking(null);
    } catch (error: any) {
      console.error('Failed to save booking:', error);
      alert(error.response?.data?.error || 'Failed to save booking');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    // Extract date/time components from the ISO string directly (treating as UTC)
    // booking.start_time is like "2025-11-27T11:00:00.000Z"
    // We want to show "2025-11-27T11:00" in the input (without timezone conversion)
    const startTimeFormatted = booking.start_time.substring(0, 16); // "2025-11-27T11:00"
    const endTimeFormatted = booking.end_time.substring(0, 16);

    setBookingForm({
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      purpose: booking.purpose || '',
    });
    setShowBookingModal(true);
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to delete this booking?\n\n${booking.user_name}\n${booking.start_time.substring(0, 16).replace('T', ' ')} - ${booking.end_time.substring(11, 16)}`)) {
      return;
    }

    try {
      await bookingsAPI.delete(booking.id);
      await fetchBookings();
      onBookingCreated();
      alert('Booking deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete booking:', error);
      alert(error.response?.data?.error || 'Failed to delete booking');
    }
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setEditingBooking(null);
    setSelectedSlot(null);
  };

  const renderHeader = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--gray-light)',
        borderRadius: '0.375rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentDate(subYears(currentDate, 1))}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Previous year"
          >
            <ChevronLeft size={16} />
            <ChevronLeft size={16} style={{ marginLeft: '-8px' }} />
          </button>
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Previous week"
          >
            ‹
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </h3>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Jump to date"
          >
            <CalendarIcon size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Next week"
          >
            ›
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Next month"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(addYears(currentDate, 1))}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title="Next year"
          >
            <ChevronRight size={16} />
            <ChevronRight size={16} style={{ marginLeft: '-8px' }} />
          </button>
        </div>
      </div>
    );
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    return (
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: 'white',
        border: '1px solid var(--border)',
        borderRadius: '0.375rem',
        padding: '1rem',
        boxShadow: 'var(--shadow)',
        zIndex: 10,
        marginTop: '0.5rem',
      }}>
        <input
          type="date"
          className="form-input"
          value={format(currentDate, 'yyyy-MM-dd')}
          onChange={(e) => {
            setCurrentDate(new Date(e.target.value));
            setShowDatePicker(false);
          }}
        />
      </div>
    );
  };

  const weekDays = getWeekDays();
  const today = new Date();

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          {equipmentName}
        </h3>
        <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
          Click on any available time slot to create a booking
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            {renderHeader()}
            {renderDatePicker()}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '800px',
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid var(--border)',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'white',
                    zIndex: 2,
                    width: '80px',
                  }}>
                    Time
                  </th>
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, today);
                    return (
                      <th
                        key={day.toString()}
                        style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          borderBottom: '2px solid var(--border)',
                          backgroundColor: isToday ? '#EFF6FF' : 'white',
                          color: isToday ? 'var(--primary)' : 'inherit',
                        }}
                      >
                        <div>{format(day, 'EEE')}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                          {format(day, 'd')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                          {format(day, 'MMM')}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour}>
                    <td style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--border)',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'white',
                      zIndex: 1,
                    }}>
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </td>
                    {weekDays.map((day) => {
                      const isBooked = isTimeSlotBooked(day, hour);
                      const booking = getBookingForSlot(day, hour);
                      const slotTime = setMinutes(setHours(startOfDay(day), hour), 0);
                      const isPast = isBefore(slotTime, new Date());
                      const isToday = isSameDay(day, today);

                      return (
                        <td
                          key={`${day.toString()}-${hour}`}
                          onClick={() => {
                            if (!isPast && !isBooked) {
                              handleTimeSlotClick(day, hour);
                            }
                          }}
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid var(--border)',
                            borderRight: '1px solid var(--border)',
                            cursor: (!isPast && !isBooked) ? 'pointer' : 'default',
                            backgroundColor: isBooked
                              ? (booking?.status === 'pending' ? '#FEF3C7' : '#D1FAE5')
                              : isPast
                              ? '#F9FAFB'
                              : isToday
                              ? '#F0F9FF'
                              : 'white',
                            opacity: isPast ? 0.5 : 1,
                            transition: 'all 0.2s',
                            minHeight: '50px',
                            verticalAlign: 'top',
                          }}
                          onMouseEnter={(e) => {
                            if (!isPast && !isBooked) {
                              e.currentTarget.style.backgroundColor = '#EFF6FF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isPast && !isBooked) {
                              e.currentTarget.style.backgroundColor = isToday ? '#F0F9FF' : 'white';
                            }
                          }}
                        >
                          {isBooked && booking && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: booking?.status === 'pending' ? '#92400E' : '#065F46',
                                wordBreak: 'break-word',
                                position: 'relative',
                              }}
                              title={`${booking.user_name}\n${booking.start_time.substring(11, 16)} - ${booking.end_time.substring(11, 16)}\n${booking.purpose || ''}\nStatus: ${booking.status}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  {booking.user_name?.split(' ')[0] || 'Booked'}
                                  {booking.status === 'pending' && (
                                    <span style={{
                                      fontSize: '0.6rem',
                                      marginLeft: '0.25rem',
                                      padding: '0.1rem 0.3rem',
                                      backgroundColor: '#F59E0B',
                                      color: 'white',
                                      borderRadius: '0.25rem',
                                      fontWeight: 'bold'
                                    }}>
                                      ⏳
                                    </span>
                                  )}
                                  <div style={{ fontSize: '0.65rem', color: 'var(--gray)' }}>
                                    {booking.start_time.substring(11, 16)} - {booking.end_time.substring(11, 16)}
                                  </div>
                                </div>
                                {!isPast && (booking.user_id === user?.id || isAdmin) && isFirstSlotOfBooking(day, hour, booking) && (
                                  <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.25rem' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditBooking(booking);
                                      }}
                                      style={{
                                        border: 'none',
                                        background: '#10B981',
                                        color: 'white',
                                        borderRadius: '0.25rem',
                                        padding: '0.15rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                      }}
                                      title="Edit booking"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBooking(booking);
                                      }}
                                      style={{
                                        border: 'none',
                                        background: '#EF4444',
                                        color: 'white',
                                        borderRadius: '0.25rem',
                                        padding: '0.15rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                      }}
                                      title="Delete booking"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--gray-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '0.25rem' }}></div>
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#D1FAE5', borderRadius: '0.25rem' }}></div>
                <span>Booked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#F9FAFB', borderRadius: '0.25rem' }}></div>
                <span>Past</span>
              </div>
            </div>
          </div>
        </>
      )}

      {showBookingModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingBooking ? 'Edit Booking' : 'Create Booking'}</h2>
              <button
                onClick={handleCloseModal}
                style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <input
                  type="text"
                  className="form-input"
                  value={equipmentName}
                  disabled
                  style={{ backgroundColor: 'var(--gray-light)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose</label>
                <textarea
                  className="form-textarea"
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                  placeholder="Describe what you'll be using this equipment for..."
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBooking ? 'Update Booking' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentCalendar;

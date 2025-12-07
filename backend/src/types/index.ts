import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  department?: string;
  phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface Equipment {
  id: string;
  name: string;
  category_id?: string;
  location?: string;
  model_number?: string;
  serial_number?: string;
  purchase_year?: number;
  purchase_cost?: number;
  status: 'active' | 'under_maintenance' | 'decommissioned' | 'reserved';
  operating_notes?: string;
  image_url?: string;
  is_bookable: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  start_time: Date;
  end_time: Date;
  purpose?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  admin_notes?: string;
  approved_by?: string;
  approved_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceHistory {
  id: string;
  equipment_id: string;
  maintenance_type: 'routine' | 'repair' | 'calibration' | 'inspection' | 'other';
  description: string;
  performed_by?: string;
  performed_date: Date;
  cost?: number;
  next_maintenance_date?: Date;
  notes?: string;
  created_at: Date;
}

export interface EquipmentRemark {
  id: string;
  equipment_id: string;
  remark_type: 'damage' | 'malfunction' | 'decommission' | 'general' | 'issue';
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reported_by?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
}

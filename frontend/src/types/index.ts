export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  department?: string;
  phone?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  location?: string;
  model_number?: string;
  serial_number?: string;
  purchase_year?: number;
  purchase_cost?: number;
  status: 'active' | 'under_maintenance' | 'decommissioned' | 'reserved';
  operating_notes?: string;
  image_url?: string;
  is_bookable: boolean;
  requires_approval: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_location?: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  admin_notes?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceHistory {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  maintenance_type: 'routine' | 'repair' | 'calibration' | 'inspection' | 'other';
  description: string;
  performed_by?: string;
  performed_by_name?: string;
  performed_date: string;
  cost?: number;
  next_maintenance_date?: string;
  notes?: string;
  created_at: string;
}

export interface EquipmentRemark {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  remark_type: 'damage' | 'malfunction' | 'decommission' | 'general' | 'issue';
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reported_by?: string;
  reported_by_name?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_by_name?: string;
  resolved_at?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  department?: string;
  phone?: string;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value?: string;
  description?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentImage {
  id: string;
  equipment_id: string;
  image_url: string;
  image_name?: string;
  is_primary: boolean;
  uploaded_by?: string;
  uploaded_by_name?: string;
  created_at: string;
}

export interface EquipmentSpec {
  id: string;
  equipment_id: string;
  spec_key: string;
  spec_value?: string;
  spec_unit?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

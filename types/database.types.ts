export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    role: 'admin' | 'agent'
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'agent'
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'agent'
                    created_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    user_id: string
                    first_name: string
                    last_name: string
                    email: string | null
                    phone: string | null
                    status: 'active' | 'lead' | 'inactive'
                    created_at: string
                    updated_at: string
                    // Extended fields
                    type: 'fisica' | 'moral'
                    rfc: string | null
                    curp: string | null
                    fiscal_regime: string | null
                    birth_date: string | null
                    gender: 'male' | 'female' | 'other' | null
                    marital_status: string | null
                    company_name: string | null
                    profession: string | null
                    job_title: string | null
                    industry: string | null
                    website: string | null
                    additional_emails: any | null // JSONB
                    additional_phones: any | null // JSONB
                    social_media: any | null // JSONB
                    // V2 Fields (Perfil 360)
                    related_contacts: any | null // JSONB [{ name, relation, type }]
                    addresses: any | null // JSONB [{ street, city, zip, type }]
                    identifications: any | null // JSONB [{ type, number, expires }]
                    billing_info: any | null // JSONB [{ bank, last4 }]
                    notes: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    first_name: string
                    last_name: string
                    email?: string | null
                    phone?: string | null
                    status?: 'active' | 'lead' | 'inactive'
                    created_at?: string
                    updated_at?: string
                    // Extended fields
                    type?: 'fisica' | 'moral'
                    rfc?: string | null
                    curp?: string | null
                    fiscal_regime?: string | null
                    birth_date?: string | null
                    gender?: 'male' | 'female' | 'other' | null
                    marital_status?: string | null
                    company_name?: string | null
                    profession?: string | null
                    job_title?: string | null
                    industry?: string | null
                    website?: string | null
                    additional_emails?: any | null
                    additional_phones?: any | null
                    social_media?: any | null
                    notes?: string | null
                    // V2 Fields (Perfil 360)
                    related_contacts?: any | null
                    addresses?: any | null
                    identifications?: any | null
                    billing_info?: any | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    first_name?: string
                    last_name?: string
                    email?: string | null
                    phone?: string | null
                    status?: 'active' | 'lead' | 'inactive'
                    created_at?: string
                    updated_at?: string
                    // Extended fields
                    type?: 'fisica' | 'moral'
                    rfc?: string | null
                    curp?: string | null
                    fiscal_regime?: string | null
                    birth_date?: string | null
                    gender?: 'male' | 'female' | 'other' | null
                    marital_status?: string | null
                    company_name?: string | null
                    profession?: string | null
                    job_title?: string | null
                    industry?: string | null
                    website?: string | null
                    additional_emails?: any | null
                    additional_phones?: any | null
                    social_media?: any | null
                    notes?: string | null
                    // V2 Fields (Perfil 360)
                    related_contacts?: any | null
                    addresses?: any | null
                    identifications?: any | null
                    billing_info?: any | null
                }
            }
            policies: {
                Row: {
                    id: string
                    client_id: string
                    policy_number: string
                    type: 'Auto' | 'GMM' | 'Vida' | 'Daños' | 'Hogar'
                    carrier: string
                    start_date: string
                    end_date: string
                    premium_amount: number
                    status: 'active' | 'expired' | 'cancelled' | 'pending_renewal'
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    policy_number: string
                    type: 'Auto' | 'GMM' | 'Vida' | 'Daños' | 'Hogar'
                    carrier: string
                    start_date: string
                    end_date: string
                    premium_amount?: number
                    status?: 'active' | 'expired' | 'cancelled' | 'pending_renewal'
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    policy_number?: string
                    type?: 'Auto' | 'GMM' | 'Vida' | 'Daños' | 'Hogar'
                    carrier?: string
                    start_date?: string
                    end_date?: string
                    premium_amount?: number
                    status?: 'active' | 'expired' | 'cancelled' | 'pending_renewal'
                    created_at?: string
                }
            }
        }
    }
}


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
            sites: {
                Row: { [key: string]: any }
                Insert: { [key: string]: any }
                Update: { [key: string]: any }
            }
            pages: {
                Row: { [key: string]: any }
                Insert: { [key: string]: any }
                Update: { [key: string]: any }
            }
            posts: {
                Row: { [key: string]: any }
                Insert: { [key: string]: any }
                Update: { [key: string]: any }
            }
            subscribers: {
                Row: { [key: string]: any }
                Insert: { [key: string]: any }
                Update: { [key: string]: any }
            }
        }
    }
}

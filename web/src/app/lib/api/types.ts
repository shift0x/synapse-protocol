export type AccessKey = {
    id: number,
    name: string,
    created_at: Date,
    owner_address: string,
    access_key: string,
    lifetime_spend: number,
    is_active: boolean
}
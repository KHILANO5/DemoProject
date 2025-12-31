export interface User {
    id: number;
    email: string;
    full_name: string;
    points_balance: number;
    avatar_url?: string;
    created_at: Date;
}

export interface Item {
    id: number;
    user_id: number;
    title: string;
    description: string;
    category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'accessories' | 'shoes';
    size: string;
    item_condition: 'like-new' | 'good' | 'fair';
    images: string[];
    points_value: number;
    status: 'available' | 'pending' | 'swapped';
    created_at: Date;
    updated_at: Date;
    uploader?: User;
}

export interface Swap {
    id: number;
    requester_id: number;
    requester_item_id?: number;
    owner_id: number;
    owner_item_id: number;
    swap_type: 'direct' | 'points';
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    created_at: Date;
    updated_at: Date;
    requester?: User;
    requester_item?: Item;
    owner?: User;
    owner_item?: Item;
}

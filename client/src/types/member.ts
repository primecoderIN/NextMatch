export type Member = {
  id: string;
  dateOfBirth: string;   // ISO date string (YYYY-MM-DD)
  imageUrl: string;
  userName: string;
  createdAt: string;     // ISO datetime string
  lastActive: string;    // ISO datetime string
  gender: string;
  description?: string;
  city: string;
  country: string;
};


export type Photo = {
  id: number;
  url: string;
  publicId?: string | null;
  memberId: string;
};

export type EditableMember = {
  userName: string;
  description?: string;
  city: string;
  country: string;
}

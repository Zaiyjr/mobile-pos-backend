export interface Brand {
  id: number;
  name: string;
}

export interface CreateBrandInput {
  name: string;
}

export interface UpdateBrandInput {
  name?: string;
}

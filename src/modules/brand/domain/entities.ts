export interface Brand {
  id: string;
  name: string;
}

export interface CreateBrandInput {
  name: string;
}

export interface UpdateBrandInput {
  name?: string;
}

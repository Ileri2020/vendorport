export interface UserProps {
  name: string;
  email?: string;
  id: string;
  image: string;
  role: string;
  contact: string;
  addresses : any[];
  shippingAddress?: any;
}

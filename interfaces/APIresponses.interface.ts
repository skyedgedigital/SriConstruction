export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T | null; // T can be any type
  error: string | null | T;
}

export interface PaymentReportResponse extends ApiResponse<any> {
  warnings?: string[];
}

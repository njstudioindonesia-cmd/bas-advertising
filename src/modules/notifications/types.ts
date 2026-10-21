export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    orderId?: string;
    orderCode?: string;
    url?: string;
  };
}

export interface WhatsAppMessageInput {
  phone: string;
  customerName?: string;
  orderCode?: string;
  total?: number;
  status?: string;
  customMessage?: string;
}

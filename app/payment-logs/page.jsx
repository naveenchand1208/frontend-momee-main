import PaymentLogsContent from './PaymentLogsContent';

export default function PaymentLogs() {
    return (
        <PaymentLogsContent
            title="Android Payment Logs"
            href="/payment-logs"
            apiRouteName="getPaymentLogs"
        />
    );
}

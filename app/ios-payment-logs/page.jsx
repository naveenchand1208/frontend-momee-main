import PaymentLogsContent from '../payment-logs/PaymentLogsContent';

export default function IosPaymentLogs() {
    return (
        <PaymentLogsContent
            title="iOS Payment Logs"
            href="/ios-payment-logs"
            apiRouteName="getIosPaymentLogs"
        />
    );
}
    
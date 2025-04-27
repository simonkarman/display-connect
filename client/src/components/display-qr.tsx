import { DisplayInformation } from '@/components/display-client';
import Image from 'next/image';

export function DisplayQR({ displayInformation }: { displayInformation: DisplayInformation }) {
  const clientUrl = process.env.NEXT_PUBLIC_KRMX_CLIENT_URL || 'ws://localhost:3000';
  const qrData = clientUrl + `?d=${displayInformation.id}`;
  return <a target="_blank" href={qrData} rel="noreferrer">
    <Image
      className="opacity-100"
      width={200}
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}`}
      alt="QR Code"
    />
  </a>
}

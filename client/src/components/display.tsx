import { DisplayControllers } from '@/components/display-controllers';
import { DisplayQR } from '@/components/display-qr';
import { displayClient, DisplayInformation, useDisplayStore } from '@/components/display-client';

export function Display({ displayInformation }: { displayInformation: DisplayInformation }) {
  const data = useDisplayStore();
  return <>
    <div className="p-3 space-y-2 max-w-[480px]">
      <h1 className="text-4xl font-bold drop-shadow">Display Connect</h1>
      <p><b>Open this page on a large screen</b>. Then, scan the QR code with your mobile device to join.</p>
      <svg viewBox={'-1 -1 12 12'} className="w-[480px] h-[480px] bg-white rounded-lg shadow-lg">
        <g transform='translate(-0.5, -0.5)'>
          {Array.from({ length: 12 }, (_, i) => (<g key={'g' + i}>
            <line
              x1={i}
              y1={0}
              x2={i}
              y2={11}
              className="stroke-gray-200 stroke-[0.05]"
            />
            <line
              x1={0}
              y1={i}
              x2={11}
              y2={i}
              className="stroke-gray-200 stroke-[0.05]"
            />
          </g>))}
        </g>
        {Object.entries(data).map(([controllerId, location]) => (
          <>
            <circle
              key={controllerId}
              cx={location?.x}
              cy={location?.y}
              r={0.4}
              className="fill-blue-500 stroke-black stroke-[0.08]"
            />
            <g transform={`translate(${location?.x} ${location?.y}) scale(0.02)`}>
              <text className='fill-white' textAnchor='middle' alignmentBaseline='middle'>{controllerId}</text>
            </g>
          </>
        ))}
      </svg>
      <DisplayControllers displayInformation={displayInformation}/>
    </div>
    <div className="absolute right-2 top-2 p-2 bg-white rounded-lg border shadow flex flex-col gap-2">
      <DisplayQR displayInformation={displayInformation}/>
      <div className="flex gap-2 justify-between">
        <p>{displayInformation.id}</p>
        <button
          className="px-1 border bg-red-200 rounded-md text-sm"
          onClick={() => displayClient.leave()}
        >Reset
        </button>
      </div>
    </div>
  </>
}

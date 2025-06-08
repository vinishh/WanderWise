'use client'

import { useRouter } from 'next/navigation'
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps'

const geoUrl =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

export default function MapPage() {
  const router = useRouter()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Interactive U.S. Map</h1>
      <ComposableMap projection="geoAlbersUsa" width={980} height={600}>
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => router.push(`/state/${stateName}`)}
                  style={{
                    default: {
                      fill: '#DDD',
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    hover: {
                      fill: '#999',
                      outline: 'none',
                    },
                    pressed: {
                      fill: '#555',
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </main>
  )
}

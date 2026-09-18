import WidgetContainer from './WidgetContainer.jsx'
import ClockWidget from './ClockWidget.jsx'
import SystemStatsWidget from './SystemStatsWidget.jsx'
import QuickNotesWidget from './QuickNotesWidget.jsx'
import WeatherWidget from './WeatherWidget.jsx'
import MusicPlayerWidget from './MusicPlayerWidget.jsx'
import CalculatorWidget from './CalculatorWidget.jsx'
import { AVAILABLE_WIDGETS } from '../../hooks/useDesktopWidgets.js'

export default function DesktopWidgets({
  widgets = [],
  uiScale = 1.15,
  onPositionChange,
  onCloseWidget,
}) {
  const renderWidgetContent = (type) => {
    switch (type) {
      case 'clock':
        return <ClockWidget />
      case 'system_stats':
        return <SystemStatsWidget />
      case 'quick_notes':
        return <QuickNotesWidget />
      case 'weather':
        return <WeatherWidget />
      case 'music_player':
        return <MusicPlayerWidget />
      case 'calculator':
        return <CalculatorWidget />
      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-1">
      {widgets.map((widget) => {
        const widgetDef = AVAILABLE_WIDGETS.find((w) => w.type === widget.type)
        const title = widgetDef?.title || 'Widget'

        return (
          <div key={widget.id} className="pointer-events-auto">
            <WidgetContainer
              id={widget.id}
              title={title}
              x={widget.x}
              y={widget.y}
              width={widget.width}
              height={widget.height}
              uiScale={uiScale}
              onPositionChange={onPositionChange}
              onClose={onCloseWidget}
            >
              {renderWidgetContent(widget.type)}
            </WidgetContainer>
          </div>
        )
      })}
    </div>
  )
}

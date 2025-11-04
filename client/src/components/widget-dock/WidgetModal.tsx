import { Modal } from '@mantine/core';
import { useWidgetStore } from '@/store/useWidgetStore';
import { getWidgetById } from './WidgetRegistry';

export const WidgetModal = () => {
  const { activeWidgetId, closeWidget } = useWidgetStore();

  if (!activeWidgetId) {
    return null;
  }

  const widgetConfig = getWidgetById(activeWidgetId);

  if (!widgetConfig) {
    return null;
  }

  const WidgetComponent = widgetConfig.component;

  return (
    <Modal
      opened={!!activeWidgetId}
      onClose={closeWidget}
      title={widgetConfig.name}
      size={widgetConfig.modalSize || 'lg'}
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      transitionProps={{
        transition: 'slide-up',
        duration: 200,
      }}
    >
      <WidgetComponent onClose={closeWidget} />
    </Modal>
  );
};

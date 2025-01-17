import { defineComponent, provide, computed } from 'vue';
import TimeLineProps from './props';
import { TimelineInjectKey, DefaultAlign } from './hooks';
import { usePrefixClass } from '../hooks/useConfig';
import { useChildComponentSlots } from '../hooks/slot';
import TimelineItem from './TimelineItem';
import log from '../_common/js/log';

export default defineComponent({
  name: 'TTimeline',
  props: TimeLineProps,

  setup(props) {
    const COMPONENT_NAME = usePrefixClass('timeline');
    const renderAlign = computed(() => {
      const { labelAlign, layout } = props;
      let res = layout === 'vertical' ? 'left' : 'top';
      if (layout === 'vertical' && labelAlign) {
        const index = DefaultAlign.horizontal.indexOf(labelAlign);
        const isError = index !== -1;
        isError && log.warn('Timeline', 'If layout is vertical, align should be "left","alternate" or "right" ');
        res = isError ? DefaultAlign.vertical[index] : labelAlign;
      }
      if (layout === 'horizontal' && labelAlign) {
        const index = DefaultAlign.vertical.indexOf(labelAlign);
        const isError = index !== -1;
        isError && log.warn('Timeline', 'If layout is horizontal, align should be "top","alternate" or "bottom" ');
        res = isError ? DefaultAlign.horizontal[index] : labelAlign;
      }
      return res;
    });

    const getChildComponentSlots = useChildComponentSlots();

    const timelineItems = computed(() => {
      const items = getChildComponentSlots('TTimelineItem');
      if (props.reverse) {
        items.reverse();
      }
      return items;
    });

    const TimeLineProvide = computed(() => {
      const { theme, reverse, layout, labelAlign, mode } = props;
      return {
        theme,
        reverse,
        itemsStatus: [''],
        layout,
        globalAlign: labelAlign,
        mode,
        renderAlign: renderAlign.value,
      };
    });

    const hasLabelItem = 1;
    provide(TimelineInjectKey, TimeLineProvide);

    return () => (
      <ul
        class={[
          `${COMPONENT_NAME.value}`,
          {
            [`${COMPONENT_NAME.value}-${renderAlign.value}`]: true,
            [`${COMPONENT_NAME.value}-reverse`]: props.reverse,
            [`${COMPONENT_NAME.value}-${props.layout}`]: true,
            [`${COMPONENT_NAME.value}-label`]: hasLabelItem,
            [`${COMPONENT_NAME.value}-label--${props.mode}`]: true,
          },
        ]}
      >
        {timelineItems.value.map((item, index) => (
          <TimelineItem
            {...item.props}
            index={index}
            class={{ [`${COMPONENT_NAME.value}-item--last`]: index === timelineItems.value.length - 1 }}
            v-slots={item.children}
          ></TimelineItem>
        ))}
      </ul>
    );
  },
});

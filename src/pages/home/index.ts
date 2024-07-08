import { defineComponent, ref } from '@vue-mini/core';

const { shared, Easing, timing } = wx.worklet;

defineComponent((_, ctx) => {
  const greeting = ref('欢迎使用 Vue Mini');
  const offset = shared(0);

  console.log('instance.applyAnimatedStyle', ctx.applyAnimatedStyle);


  ctx.applyAnimatedStyle('.box', () => {
    'worklet';
    console.info('@@ ', offset.value)
    return {
      width: '80px',
      height: '80px',
      transform: `translateX(${offset.value}px)`
    }
  })


  function tap() {
    console.log('点击了');

    offset.value = 0;



    console.log('offset', offset.value);

    /**
     * 目标值 300
     * 动画时长 200ms
     * 动画曲线 Easing.ease
     */
    offset.value = timing(300, {
      duration: 1200,
      easing: (Easing as any).ease,
    }, () => { });

  }


  return {
    greeting,
    tap,
  };
});

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/scss';
import 'swiper/scss/navigation';
// import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';
import './Demo.scss'

const Demo = () => {
  const swiperInstance = useRef<SwiperClass>();
  const [x, setX] = useState<number>(2);
  useEffect(() => {
    if (x === 1) {
      swiperInstance.current!.slideTo(0);
    }
  }, [x]);
  return (
    <Swiper
      // install Swiper modules
      modules={[Navigation]}
      spaceBetween={50}
      slidesPerView={1}
      navigation={x === 2}
      onSwiper={(swiper: SwiperClass) => swiperInstance.current = swiper}
      onSlideChange={() => console.log('slide change')}
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
      <SwiperSlide>Slide 4</SwiperSlide>
    </Swiper>
  );
};

export default Demo;


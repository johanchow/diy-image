import React from 'react';
import './Loading.scss'
import SpinIcon from '../../assets/spinner-solid.svg';

const Loading: React.FC<{
  isLoading: boolean;
}> = (props) => {
  const { isLoading } = props;
  if (!isLoading) {
    return <></>
  }
  return (
    <div className='loading-wrapper'>
      <img src={SpinIcon} alt="" />
    </div>
  );
}

export default Loading;

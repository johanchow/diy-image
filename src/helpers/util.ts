const getVwPx = () => {
  return window.innerWidth / 100;
};

const loadJsScript = (src: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;

    // 当脚本加载成功时调用 resolve
    script.onload = () => {
      resolve(`Script loaded: ${src}`);
    };

    // 当脚本加载失败时调用 reject
    script.onerror = () => {
      reject(new Error(`Script load error: ${src}`));
    };

    document.head.appendChild(script);
  });
};

export {
  getVwPx,
  loadJsScript,
};

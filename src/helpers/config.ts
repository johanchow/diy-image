let ApiHost: string;
const WebHost = '//clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com';

if (process.env.REACT_APP_BUILD_ENV === 'prod') {
  ApiHost = "//hewohua.com";
  // ApiHost = "//localhost:5000";
} else {
  // ApiHost = "//clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com";
  ApiHost = "//localhost:5000";
}

export {
  ApiHost,
  WebHost,
};

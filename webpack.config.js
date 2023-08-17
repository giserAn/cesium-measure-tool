const path = require('path')

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.min.js',
    library: 'MeasureTool',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  // mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'], // 解析对文件格式
  },
  externals: {
    cesium: 'Cesium', // index.min.js 排除第三方依赖 cesium 的打包
  },
}

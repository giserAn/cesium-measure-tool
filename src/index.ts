import * as Cesium from 'cesium'
import { _calcAllDistance2text, _calcArea2text, _calcDistance2text, _mathAreaAndCenter, _mathMidpoint } from './utils'

/**
 * 测量工具分类
 */
export enum MeasureType {
  /**
   * 距离测量
   */
  Distance = 'distance',
  /**
   * 面积测量
   */
  Area = 'area',
}

/**
 * constructor Options
 */
export type Options = {
  /**
   * 测距离时，是否显示总距离 默认：true
   */
  showAllDistance?: boolean
  /**
   * 测距离时，显示总距离的位置，图形中间‘center’,绘线末尾‘end’ 默认：'center'
   */
  showAllDistancePosition?: 'center' | 'end'
  /**
   * 绘制线的样式
   */
  polylineStyle?: Cesium.PolylineGraphics | Cesium.PolylineGraphics.ConstructorOptions
  /**
   * 绘制面的样式
   */
  polygonStyle?: Cesium.PolygonGraphics | Cesium.PolygonGraphics.ConstructorOptions
  /**
   * 绘制label的样式
   */
  labelStyle?: Cesium.LabelGraphics | Cesium.LabelGraphics.ConstructorOptions
  /**
   * 监听绘制完成事件
   */
  onDrawEnd?: (arg0: MeasureType, positions: Cesium.Cartesian3[]) => void
}

export default class MeasureTool {
  private viewer: Cesium.Viewer
  private options: Options // 自定义样式
  private measureType: MeasureType = MeasureType.Distance
  private dataSource: Cesium.CustomDataSource | undefined
  private _mousePos: Cesium.Cartesian3 | undefined // 鼠标移动点
  private tempPositions: Cesium.Cartesian3[] = [] // 所有成图点

  // 鼠标事件句柄
  private handler: Cesium.ScreenSpaceEventHandler | undefined

  /**
   * constructor(viewer: Cesium.Viewer,options?: PolygonGraphics.ConstructorOptions);
   * @param viewer
   * @param options
   */
  constructor(viewer: Cesium.Viewer, options?: Options) {
    this.viewer = viewer
    this.options = {
      showAllDistance: true,
      showAllDistancePosition: 'center',
      polylineStyle: {},
      polygonStyle: {},
      labelStyle: {},
      ...options,
    }

    // 自定义添加数据源图层
    this.dataSource = new Cesium.CustomDataSource('Measure_dataSource')
    this.viewer.dataSources.add(this.dataSource)

    //初始化事件
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
  }

  /**
   * 激活工具
   * @param measureType 测量类型
   */
  activate(measureType: MeasureType) {
    this.clearAll()
    this.measureType = measureType
    this.registerEvents() //注册鼠标事件
    // @ts-ignore
    this.viewer._element.style.cursor = 'crosshair'
  }

  /**
   * 取消激活工具
   */
  deactivate() {
    this.unRegisterEvents() //取消鼠标事件
    this._mousePos = undefined
    // @ts-ignore
    this.viewer._element.style.cursor = 'default'
  }

  /**
   * 清除所有
   */
  clearAll() {
    this.deactivate()
    this.dataSource?.entities.removeAll()
    this.tempPositions = []
  }

  //注册鼠标事件
  private registerEvents() {
    this.leftClickEvent()
    this.rightClickEvent()
    this.mouseMoveEvent()
  }

  //解除鼠标事件
  private unRegisterEvents() {
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }

  //绘制结束 触发结束事件
  private drawEnd() {
    this.options?.onDrawEnd?.(this.measureType, this.tempPositions)
    this.deactivate()
  }

  // 鼠标左键事件
  private leftClickEvent() {
    this.handler?.setInputAction((e: any) => {
      let ray = this.viewer.camera.getPickRay(e.position) //获取一条射线
      if (!ray) return
      let p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (!p) return

      this.tempPositions.push(p.clone())

      // 开始绘制
      this.drawStart2InitEntity()
      // 刷新 label
      this.refreshEntityLabel()
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  // 鼠标移动事件
  private mouseMoveEvent() {
    this.handler?.setInputAction((e: any) => {
      if (this.tempPositions.length === 0) return

      let ray = this.viewer.camera.getPickRay(e.endPosition) //获取一条射线
      if (!ray) return
      let p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (!p) return
      this._mousePos = p

      // 刷新 label
      this.refreshEntityLabel()
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  // 鼠标右键事件
  private rightClickEvent() {
    this.handler?.setInputAction((e: any) => {
      let ray = this.viewer.camera.getPickRay(e.position) //获取一条射线
      if (!ray) return
      let p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (!p) return
      this.tempPositions.push(p.clone())

      // 结束绘制
      this.drawEnd()
      // 刷新 label
      this.refreshEntityLabel()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  // 分类 entity实例
  private drawStart2InitEntity() {
    if (this.tempPositions.length === 1) {
      // 第一次实例化一次，其他点以 CallbackProperty 获取
      switch (this.measureType) {
        case MeasureType.Distance:
          this.addMeasureDistanceEntity()
          break
        case MeasureType.Area:
          this.addMeasureAreaEntity()
          break
      }
    }
  }

  // 分类 刷新label操作
  private refreshEntityLabel() {
    switch (this.measureType) {
      case MeasureType.Distance:
        this.addMeasureDistanceEntityLabel()
        break
      case MeasureType.Area:
        this.addMeasureAreaEntityLabel()
        break
    }
  }

  // 添加测距离entity
  private addMeasureDistanceEntity() {
    const { positions, ...style } = this.options.polylineStyle || {}
    const id = `${this.measureType}-id`
    this.dataSource?.entities.removeById(id)
    this.dataSource?.entities.add({
      id: id,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          let c = Array.from(this.tempPositions)
          if (this._mousePos) {
            c.push(this._mousePos)
          }
          return c
        }, false),
        clampToGround: true, //贴地
        width: 3,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        ...style,
      },
    })
  }
  // 添加测面积entity
  private addMeasureAreaEntity() {
    const { hierarchy, ...style1 } = this.options.polygonStyle || {}
    const { positions, ...style2 } = this.options.polylineStyle || {}

    const id = `${this.measureType}-id`
    this.dataSource?.entities.removeById(id)
    this.dataSource?.entities.add({
      id: id,
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          if (this.tempPositions.length >= 2) {
            let pts = Array.from(this.tempPositions)
            if (this._mousePos) {
              pts.push(this._mousePos)
            }
            return new Cesium.PolygonHierarchy(pts)
          }
        }, false),
        material: Cesium.Color.RED.withAlpha(0.4),
        ...style1,
      } as any,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          let pts = Array.from(this.tempPositions)
          if (this._mousePos) {
            pts.push(this._mousePos)
          }
          pts.push(pts[0]) //与第一个点相连
          return pts
        }, false),
        clampToGround: true, //贴地
        width: 3,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        ...style2,
      },
    })
  }

  // 添加测距离entity label
  private addMeasureDistanceEntityLabel() {
    if (this._mousePos) {
      // 移动中
      const len = this.tempPositions.length
      if (len >= 1) {
        let [p1, p2] = [this.tempPositions[len - 1], this._mousePos]
        // 中点
        const centerP = _mathMidpoint(p1, p2)
        // 距离
        const distanceText = _calcDistance2text(p1, p2)
        this.addLabel(centerP, distanceText, len)
      }
    } else {
      const len = this.tempPositions.length
      if (len >= 2) {
        let [p1, p2] = [this.tempPositions[len - 1], this.tempPositions[len - 2]]
        // 中点
        const centerP = _mathMidpoint(p1, p2)
        // 距离
        const distanceText = _calcDistance2text(p1, p2)
        this.addLabel(centerP, distanceText, len)

        if (this.options.showAllDistance && len >= 3) {
          // 总距离
          const allDistanceText = _calcAllDistance2text(this.tempPositions)

          if (this.options.showAllDistancePosition === 'center') {
            let points = [...this.tempPositions, this.tempPositions[0]]
            const { centroid } = _mathAreaAndCenter(points)
            this.addLabel(centroid, allDistanceText, 0)
          } else {
            this.addLabel(p1, allDistanceText, 0)
          }
        }
      }
    }
  }
  // 添加测面积entity label
  private addMeasureAreaEntityLabel() {
    if (this._mousePos) {
      // 移动中
      const len = this.tempPositions.length
      if (len >= 2) {
        let points = [...this.tempPositions, this._mousePos, this.tempPositions[0]]
        const { text, centroid } = _calcArea2text(points)
        this.addLabel(centroid, text)
      }
    } else {
      const len = this.tempPositions.length
      if (len >= 3) {
        let points = [...this.tempPositions, this.tempPositions[0]]
        const { text, centroid } = _calcArea2text(points)
        this.addLabel(centroid, text)
      }
    }
  }

  // 画标签
  private addLabel(centerP: Cesium.Cartesian3, label: string, index: number = 1) {
    const { text, ...style } = this.options.labelStyle || {}
    const id = `${this.measureType}-id-label-${index}`
    this.dataSource?.entities.removeById(id)
    this.dataSource?.entities.add({
      id: id,
      position: centerP,
      label: {
        text: label,
        font: '14px sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL  FILL_AND_OUTLINE OUTLINE
        fillColor: Cesium.Color.YELLOW,
        showBackground: true, //指定标签后面背景的可见性
        backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8), // 背景颜色
        backgroundPadding: new Cesium.Cartesian2(6, 6), //指定以像素为单位的水平和垂直背景填充padding
        pixelOffset: new Cesium.Cartesian2(0, -25),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        ...style,
      },
    })
  }
}

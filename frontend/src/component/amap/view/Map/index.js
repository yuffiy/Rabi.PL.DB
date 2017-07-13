// -*- mode: js-jsx -*-
// -*- coding: utf-8 -*-
// @flow

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import loadMap from '../../lib/load-map'
import bindEvents, { removeEvents } from '../../lib/bind-events'
import mapLocationToPosition from '../../lib/map-location-to-position'
import InfoWindow from '../InfoWindow'
import type {
  MapComponent,
  EventMap,
  MapComponentContext,
  LocationCenter
} from '../../lib/base-interface'
import style from './style.css'

type MapEvent = {
  onClick?: Function,
  onDoubleClick?: Function,
  onContextMenu?: Function,
  onMouseMove?: Function,
  onMouseWheel?: Function,
  onMouseOver?: Function,
  onMouseOut?: Function,
  onMouseUp?: Function,
  onMouseDown?: Function,
  onTouchStart?: Function,
  onTouchMove?: Function,
  onTouchEnd?: Function,
  onComplete?: Function,
  onMapMove?: Function,
  onMoveStart?: Function,
  onMoveEnd?: Function,
  onZoomChange?: Function,
  onZoomStart?: Function,
  onZoomEnd?: Function,
  onDragStart?: Function,
  onDrag?: Function,
  onDragEnd?: Function,
  onResize?: Function,
  onHotSpotClick?: Function,
  onHotSpotOver?: Function,
  onHotSpotOut?: Function
}

type Prop = {
  children?: React.Element<*>,
  center?: string | $PropertyType<AMap$MapOptions, 'center'>,
  height: number,
  width: number,
  mapkey?: string,
  plugins?: Array<string>,
  disabled: boolean
} & typeof AMap.MapOptions &
  MapEvent

type State = {
  mount: boolean
}

class Map extends Component<void, Prop, State> implements MapComponent {
  // Interface
  AMap: typeof AMap
  map: AMap.Map
  events: EventMap = {}

  // Container refs
  container: HTMLElement

  // Component state
  state = {
    mount: false
  }

  componentWillReceiveProps(nextProps: Prop): void {
    if (nextProps.zoom !== this.props.zoom) {
      this.map.setZoom(nextProps.zoom)
    }

    if (nextProps.center && nextProps.center !== this.props.center) {
      if (typeof nextProps.center !== 'string') {
        this.map.setCenter(nextProps.center)
      } else {
        mapLocationToPosition(
          this.AMap,
          nextProps.center
        ).then((location: ?LocationCenter) => {
          if (location) {
            const loc = Array.isArray(location) ? location : location.position
            this.map.setCenter(loc)
          }
        })
      }
    }
  }
  load(): Promise<void> {
    const { container } = this
    const { center, zoom } = this.props

    function setMap(location: ?LocationCenter): void {
      const loc =
        !location || Array.isArray(location) ? location : location.position
      this.map = new AMap.Map(container, {
        center: loc,
        zoom,
        mapStyle: 'amap://styles/whitesmoke'
      })
    }

    return mapLocationToPosition(this.AMap, center).then(setMap.bind(this))
  }
  componentDidMount(): void {
    function ready(AMap): Promise<void> {
      this.AMap = AMap

      function setMountAndBindEvents(): void {
        this.events = bindEvents(AMap, this.map, this.props, {
          onDoubleClick: 'dblclick',
          onContextMenu: 'rightclick',
          onDrag: 'dragging'
        })
        this.setState({ mount: true })
      }

      return this.load().then(setMountAndBindEvents.bind(this))
    }

    const { mapkey, plugins } = this.props

    loadMap({ key: mapkey, plugins }).then(ready.bind(this)).catch(err => {
      // Error Handle
      throw err
    })
  }
  componentWillUnmount(): void {
    this.events = removeEvents(this.AMap, this.events)
    this.map.clearMap()
    this.map.clearInfoWindow()
    this.map.destroy()
  }
  getChildContext(): MapComponentContext {
    return {
      AMap: this.AMap,
      map: this.map
    }
  }
  render() {
    const { width, height, children } = this.props

    const containerStyle: { [string]: string } = {
      ...(width ? { width: width + 'px' } : {}),
      ...(height ? { height: height + 'px' } : {})
    }

    // Check <InfoWindow /> component number.
    if (process.env.NODE_ENV === 'development') {
      if (children && Array.isArray(children)) {
        const infowindows: Array<React.Element<*>> = children.filter(
          x => x.type === InfoWindow
        )

        if (infowindows.length > 1) {
          console.warn(`[AMap] Find ${infowindows.length} <InfoWindow /> components. \
Superfluous will be ignored except for the last one.`)
        }
      }
    }

    return (
      <div
        ref={ref => (this.container = ref)}
        style={containerStyle}
        className={style.container}
      >
        {this.state.mount ? children : null}
      </div>
    )
  }
}

Map.childContextTypes = {
  AMap: PropTypes.object,
  map: PropTypes.object
}

export default Map

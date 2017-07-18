import { h, render, Component } from 'preact'

import {initDevTools} from 'preact/devtools/devtools'
initDevTools()

// Fancy image slider.
// Props:
//  - src: URI to image with {} as placeholder
//  - labels: Array of labels with {name, title} objects. title is shown, name is inserted in src.
class Slider extends Component {
	constructor() {
		super()
		this.setCurrent = this.setCurrent.bind(this)

		this.state.current = 0
	}

	setCurrent(index) {
		this.setState({current: index})
	}

	render({src, labels}, {current, offsets, maxLabelWidth, dragging, dragOffset}) {
		let {name, title} = labels[current]
		let img = src.replace('{}', name)
		return (
			<div class="slider">
				<img class="slider-image" src={img} alt={title} />
				<SlidingControl labels={labels} current={current} onChange={this.setCurrent} />
			</div>
		)
	}
}

// Provides a sliding selection control.
// Props:
//  - el: Element which can be dragged
//  - labels: Array of labels with {name, title}
//  - current: Index of currently active label
//  - onChange(i): Function called when current changes to i
class SlidingControl extends Component {
	constructor() {
		super()
		this.dragging = this.dragging.bind(this)
		this.stopDrag = this.stopDrag.bind(this)
		this.updateOffsets = this.updateOffsets.bind(this)

		this.state.offsets = []
	}

	updateOffsets() {
		let controls = Array.from(this.controls.children)
		let maxLabelWidth = controls.reduce(((max, n) => Math.max(max, n.offsetWidth)), 0)
		let base = this.marker.offsetLeft + this.marker.offsetWidth / 2
		let offsets = controls.map(n => base - n.offsetLeft - n.offsetWidth / 2)
		this.setState({offsets, maxLabelWidth})
	}

	startDrag(event) {
		document.body.addEventListener('pointermove', this.dragging)
		document.body.addEventListener('pointerup', this.stopDrag)
		document.body.addEventListener('pointercancel', this.stopDrag)
		this.setState({dragging: true, dragOffset: this.state.offsets[this.props.current]})
		this.dragOrigin = event.clientX
		event.preventDefault()
	}

	dragging(event) {
		// Update offset from distance moved since last event.
		let dragOffset = this.state.dragOffset - this.dragOrigin + event.clientX
		this.dragOrigin = event.clientX
		// Update current image by comparing offsets of neighboring labels.
		let {offsets} = this.state
		let {current, onChange} = this.props
		if (current < offsets.length - 1 && dragOffset < (offsets[current] + offsets[current+1]) / 2)
			onChange(current + 1)
		else if (current > 0 && dragOffset > (offsets[current-1] + offsets[current]) / 2)
			onChange(current - 1)
		this.setState({dragOffset})
	}

	stopDrag() {
		document.body.removeEventListener('pointermove', this.dragging)
		document.body.removeEventListener('pointerup', this.stopDrag)
		document.body.removeEventListener('pointercancel', this.stopDrag)
		this.setState({dragging: false})
	}

	componentDidMount() {
		this.updateOffsets()
		window.addEventListener('resize', this.updateOffsets)
	}

	componentWillUnmount() {
		this.stopDrag()
		window.removeEventListener('resize', this.updateOffsets)
	}

	render({labels, current, onChange}, {offsets, maxLabelWidth, dragging, dragOffset}) {
		let {name, title} = labels[current]
		let offset = dragging ? dragOffset : offsets[current]
		return (
			<div class="slider-wrapper" onPointerDown={e => this.startDrag(e)}>
				<div class="marker" style={`width: ${maxLabelWidth}px`} ref={el => this.marker = el}></div>
				<ol class={`slider-controls ${dragging ? '-dragging' : ''}`} style={`left: ${offset}px`} ref={el => this.controls = el}>
					{labels.map(({title}, index) =>
						<li class={current == index ? 'current' : ''} onClick={() => onChange(index)}>{title}</li>
					)}
				</ol>
			</div>
		)
	}
}

export default class Slider2 {
	constructor(el, options) {
		render(<Slider src={options.src} labels={options.labels} />, el)
	}
}
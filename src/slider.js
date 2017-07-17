import { h, render, Component } from 'preact'

class Slider extends Component {
	constructor() {
		super()
		this.dragging = this.dragging.bind(this)
		this.stopDrag = this.stopDrag.bind(this)

		this.state.current = 0
		this.state.offsets = []
	}

	setCurrent(index) {
		this.setState({current: index})
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
		this.setState({dragging: true, dragOffset: this.state.offsets[this.state.current]})
		this.dragOrigin = event.clientX
		event.preventDefault()
	}

	dragging(event) {
		// Update offset from distance moved since last event.
		let dragOffset = this.state.dragOffset - this.dragOrigin + event.clientX
		this.dragOrigin = event.clientX
		// Update current image by comparing offsets of neighboring labels.
		let {current, offsets} = this.state
		if (current < offsets.length - 1 && dragOffset < (offsets[current] + offsets[current+1]) / 2)
			current += 1;
		else if (current > 0 && dragOffset > (offsets[current-1] + offsets[current]) / 2)
			current -= 1;
		this.setState({dragOffset, current})
	}

	stopDrag() {
		document.body.removeEventListener('pointermove', this.dragging)
		document.body.removeEventListener('pointerup', this.stopDrag)
		document.body.removeEventListener('pointercancel', this.stopDrag)
		this.setState({dragging: false})
	}

	componentDidMount() {
		this.updateOffsets()
	}

	componentWillUnmount() {
		this.stopDrag()
	}

	render({src, labels}, {current, offsets, maxLabelWidth, dragging, dragOffset}) {
		let {name, title} = labels[current]
		let img = src.replace('{}', name)
		let offset = dragging ? dragOffset : offsets[current]
		return (
			<div class="slider">
				<img class="slider-image" src={img} alt={title} />

				<div class="slider-wrapper" onPointerDown={e => this.startDrag(e)}>
					<div class="marker" style={`width: ${maxLabelWidth}px`} ref={el => this.marker = el}></div>
					<ol class={`slider-controls ${dragging ? '-dragging' : ''}`} style={`left: ${offset}px`} ref={el => this.controls = el}>
						{labels.map(({title}, index) =>
							<li class={current == index ? 'current' : ''} onClick={() => this.setCurrent(index)}>{title}</li>
						)}
					</ol>
				</div>
			</div>
		)
	}
}

export default class Slider2 {
	constructor(el, options) {
		render(<Slider src={options.src} labels={options.labels} />, el)
	}
}

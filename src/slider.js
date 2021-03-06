import { h, render, Component } from 'preact'

//import {initDevTools} from 'preact/devtools/devtools'
//initDevTools()

// Fancy image slider.
// Props:
//  - src: URI to image with {} as placeholder
//  - labels: Array of labels with {name, title} objects. title is shown, name is inserted in src.
//  - desc: Description for the whole slider
//  - default: Index, name or title of the initial element
class Slider extends Component {
	constructor(props) {
		super(props)
		this.setCurrent = this.setCurrent.bind(this)

		this.state.current = typeof props.default == 'number'
			? props.default
			: typeof props.default == 'string'
			? props.labels.findIndex(({name, title}) => name == props.default || title == props.default)
			: 0
	}

	componentDidMount() {
		// Preload all images.
		let {src, labels} = this.props
		labels.forEach(label => {
			let img = new Image()
			img.src = this.labelToSrc(label)
		})
	}

	// Returns image src for the given label.
	labelToSrc(label) {
		return this.props.src.replace('{}', label.name)
	}

	setCurrent(index) {
		this.setState({current: index})
	}

	render({desc, labels}, {current, offsets, maxLabelWidth, dragging, dragOffset}) {
		let label, {name, title} = label = labels[current]
		let img = this.labelToSrc(label)
		return (
			<div class="image-slider">
				<img src={img} alt={title} />
				<SlidingControl desc={desc} labels={labels} current={current} onChange={this.setCurrent} />
			</div>
		)
	}
}

// Provides a sliding selection control.
// Props:
//  - labels: Array of labels with {name, title}
//  - current: Index of currently active label
//  - onChange(i): Function called when current changes to i
class SlidingControl extends Component {
	constructor() {
		super()
		this.wheel = this.wheel.bind(this)
		this.arrowButton = this.arrowButton.bind(this)
		this.startDrag = this.startDrag.bind(this)
		this.dragging = this.dragging.bind(this)
		this.stopDrag = this.stopDrag.bind(this)
		this.updateOffsets = this.updateOffsets.bind(this)

		this.state.offsets = []
	}

	updateOffsets() {
		let controls = Array.from(this.controls.children)
		let maxLabelWidth = controls.reduce(((max, n) => Math.max(max, n.offsetWidth)), 0)
		let base = maxLabelWidth / 2
		let offsets = controls.map(n => base - n.offsetLeft - n.offsetWidth / 2)
		this.setState({offsets, maxLabelWidth})
	}

	wheel(event) {
		let {labels, current, onChange} = this.props
		if (event.deltaY > 0 && current < labels.length - 1)
			onChange(current + 1)
		else if (event.deltaY < 0 && current > 0)
			onChange(current - 1)
		event.preventDefault()
	}

	arrowButton(event) {
		let {current, labels, onChange} = this.props
		// arrow right
		if (event.keyCode == 39 && current < labels.length -1)
			ok(current + 1)
		// arrow left
		else if (event.keyCode == 37 && current > 0)
			ok(current - 1)
		function ok(i) {
			onChange(i)
			event.preventDefault()
		}
	}

	startDrag(event) {
		document.body.addEventListener('pointermove', this.dragging)
		document.body.addEventListener('pointerup', this.stopDrag)
		document.body.addEventListener('pointercancel', this.stopDrag)
		this.setState({dragging: true, dragOffset: this.state.offsets[this.props.current]})
		this.dragOrigin = event.clientX
		// PEP Polyfill: don't prevent click on left/right buttons
		if (!(event.target instanceof HTMLButtonElement))
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
	}

	componentWillUnmount() {
		this.stopDrag()
	}

	render({desc, labels, current, onChange}, {offsets, maxLabelWidth, dragging, dragOffset}) {
		let {name, title} = labels[current]
		let offset = dragging ? dragOffset : offsets[current]
		return (
			<div class="sliding-control" onPointerDown={this.startDrag} onWheel={this.wheel} onKeyDown={this.arrowButton} tabindex="0" touch-action="none">
				<div class="caption">
					<button style={`visibility: ${current > 0 ? 'visible' : 'hidden'}`} onClick={() => onChange(current - 1)}>🡰</button>
					<span>{desc} <strong>{title}</strong></span>
					<button style={`visibility: ${current < labels.length - 1 ? 'visible' : 'hidden'}`} onClick={() => onChange(current + 1)}>🡲</button>
				</div>
				<div class="marker" style={`width: ${maxLabelWidth}px`} ref={el => this.marker = el}>
					<ol class={classNames('labels', dragging && '-dragging')} style={`left: ${offset}px`} ref={el => this.controls = el}>
						{labels.map(({title}, index) =>
							<li class={classNames(current == index && '-current',
							                      index < current && `-pre-${Math.min(current - index, 3)}`,
							                      index > current && `-post-${Math.min(index - current, 3)}`
							)} onClick={() => onChange(index)}>{title}</li>
						)}
					</ol>
					<div class="border"></div>
				</div>
			</div>
		)
	}
}

function classNames() {
	return Array.from(arguments).filter(a => !!a).join(' ')
}

export default class Slider2 {
	constructor(el, options) {
		render(<Slider desc={options.desc} src={options.src} labels={options.labels} default={options.default} />, el)
	}
}

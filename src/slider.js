import { h, render, Component } from 'preact'

class Slider extends Component {
	constructor() {
		super()
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

	componentDidMount() {
		this.updateOffsets()
	}

	render({src, labels}, {current, offsets, maxLabelWidth}) {
		let {name, title} = labels[current]
		let img = src.replace('{}', name)
		let offset = offsets[current]
		return (
			<div class="slider">
				<img class="slider-image" src={img} alt={title} />

				<div class="slider-wrapper">
					<div class="marker" style={`width: ${maxLabelWidth}px`} ref={el => this.marker = el}></div>
					<ol class="slider-controls" style={`left: ${offset}px`} ref={el => this.controls = el}>
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

import './App.css';
import {useEffect, useLayoutEffect, useRef, useReducer, createContext, useContext} from 'react';

enum SLIDER_ACTIONS {
    SET_INDEX,
    SET_AUTO,
    NAVIGATE_INDEX,
    NAVIGATE_NEXT,
    NAVIGATE_PREV
};

type Slide =  {
    title: string,
    description: string,
    photo: string
};

type SliderState = {
    currentSlideIndex: number,
    auto: boolean,
}

type SliderConfig = {
    duration: number,
    slides: Slide[]
}

type SimpleSliderAction = {
    type: SLIDER_ACTIONS
}

type ToIndexAction = {
    type: SLIDER_ACTIONS.SET_INDEX | SLIDER_ACTIONS.NAVIGATE_INDEX,
    toIndex: number
}

type SetAutoAction = {
    type: SLIDER_ACTIONS.SET_AUTO,
    auto: boolean
}

type SliderAction = SimpleSliderAction | ToIndexAction | SetAutoAction;

type SliderDispatch = (action: SliderAction) => void;

class SliderDispatcher {
    constructor(public dispatch: SliderDispatch) { }

    setIndex(toIndex: number) {
        this.dispatch({ type: SLIDER_ACTIONS.SET_INDEX, toIndex });
    }

    navigate(toIndex: number) {
        this.dispatch({ type: SLIDER_ACTIONS.NAVIGATE_INDEX, toIndex });
    }
    navigateNext() {
        this.dispatch({ type: SLIDER_ACTIONS.NAVIGATE_NEXT });
    }

    navigatePrev() {
        this.dispatch({ type: SLIDER_ACTIONS.NAVIGATE_PREV });
    }

    setAuto(auto: boolean) {
        this.dispatch({ type: SLIDER_ACTIONS.SET_AUTO, auto });
    }

}

type SliderControler = {
    sliderState: SliderState,
    sliderDispatcher: SliderDispatcher
    sliderConfig: SliderConfig
}

const slides: Slide[] = [
    { title: 'Elon Musk', description: 'Richest Guy', photo: 'url("slides/musk.jpeg")' },
    { title: 'Bill Gates', description: 'Founder of Microsoft', photo: 'url(slides/gates.jpeg)' },
    { title: 'Steve Jobs', description: 'Created the iPhone', photo: 'url(slides/jobs.jpeg)' },
];

const sliderInitialState = { currentSlideIndex: 0, auto: true };

const SliderContext = createContext({
    sliderState: sliderInitialState,
    sliderConfig: {
        slides: [],
        duration: 3
    },
    sliderDispatcher: new SliderDispatcher(() => {})
} as SliderControler);


function SlideComponent({photo}: Slide) {
    return (
        <div className={'slide'} style={{backgroundImage: photo}}>
        </div>
    );
}

const useFocus = () : [ React.RefObject<HTMLButtonElement>, Function] => {
    const htmlElRef = useRef<HTMLButtonElement>(null)
    const setFocus = () => {htmlElRef.current &&  htmlElRef.current.focus()}
    return [ htmlElRef, setFocus ];
}

function SliderBubble({i} : {i: number}) {
    const {sliderState, sliderDispatcher} = useContext(SliderContext);
    const onClickBubble = (e: React.MouseEvent<HTMLElement>) => {
        sliderDispatcher.navigate(i)
        e.preventDefault();
    };

    const onFocusBubble = () => {
        if(i === sliderState.currentSlideIndex) { return; }
        sliderDispatcher.navigate(i);
    };

    const [bubbleLinkRef, setBubbleLinkFocus] = useFocus();

    useEffect(() => {
        if(i === sliderState.currentSlideIndex) {
            setBubbleLinkFocus();
        }
    });

    return (
        <li
            key={i}
            className="slider-bubble"
        >
            <button
                ref={bubbleLinkRef}
                onClick={onClickBubble}
                onFocus={onFocusBubble}
            >{i+1}
            </button>
        </li>
    );
}

//slideIndex, isAutoSliding, duration, slideCount, auto, dispatch
function SliderNavigation( ) {
    const {sliderState, sliderDispatcher} = useContext(SliderContext);

    const slideBubbles = [];
    for(let i = 0; i < slides.length; i++) {
        slideBubbles.push(<SliderBubble i={i} key={i} />);
    }

    return (
        <div className={'slider-navigation'}>
            {sliderState.auto && <SliderProgressBar />}
            <div className={'slider-navigation-controls'}>
                <ul className={'slider-bubbles'}>
                    {slideBubbles}
                </ul>
                <div className={'slider-spacer'}>

                </div>
                <div className={'slider-buttons'}>
                    {sliderState.auto ? <button onClick={() => sliderDispatcher.setAuto(false)}>PAUSE</button> :
                        <button onClick={() => sliderDispatcher.setAuto(true)}>START</button>
                    }

                    <button onClick={() => sliderDispatcher.navigatePrev()}>PREV</button>
                    <button onClick={() => sliderDispatcher.navigateNext()}>NEXT</button>
                </div>
            </div>
        </div>
    )
}

function SliderProgressBar() {
    const progressBarRef = useRef(null);
    const {sliderState,sliderConfig} = useContext(SliderContext);

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            progressBarRef.current.style.width = '100%';
        });

        return () => {
            clearTimeout(timeout);
        }
    }, [sliderState.currentSlideIndex]);


    // @ts-ignore
    return <div ref={progressBarRef}  className={'slider-progress'} style={{ "--interval": sliderConfig.duration+'s'}} />
}

const useSliderReducer = (() => {
    return useReducer((state: SliderState, action: any) => {
        const setIndex = (state: SliderState, toIndex: number): SliderState => {
            if(toIndex === -1) {
                toIndex = slides.length-1;
            }

            if(toIndex === slides.length) {
                toIndex = 0;
            }

            return {...state, currentSlideIndex: toIndex};
        };

        const navigate = (state: SliderState, toIndex: number): SliderState => {
            state = setIndex(state, toIndex);
            return {...state, auto: false};
        }

        switch(action.type) {
            case SLIDER_ACTIONS.SET_AUTO:
                return {...state, auto: !!action.auto}
            case SLIDER_ACTIONS.NAVIGATE_INDEX:
                return navigate(state, action.toIndex);
            case SLIDER_ACTIONS.NAVIGATE_NEXT:
                return navigate(state, state.currentSlideIndex+1);
            case SLIDER_ACTIONS.NAVIGATE_PREV:
                return navigate(state, state.currentSlideIndex-1);
            case SLIDER_ACTIONS.SET_INDEX:
                return setIndex(state, action.toIndex);
            default: return state;
        }
    }, sliderInitialState);
});

const useDocumentTitleEffect = (title: string) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
};

const useSlideTimeoutEffect = ({sliderState, sliderConfig, sliderDispatcher}: SliderControler) => {
    useEffect(() => {
        if(!sliderState.auto) { return; }

        const timeout = setTimeout(
            () => {
                sliderDispatcher.setIndex(sliderState.currentSlideIndex+1)
            },
            sliderConfig.duration*1000
        );

        return () => {
            clearTimeout(timeout);
        };
    }, [sliderState.auto,sliderState.currentSlideIndex,sliderConfig.duration,sliderDispatcher]);
};

function Slider(sliderConfig: SliderConfig) {
    const [sliderState, dispatch] = useSliderReducer();
    const slide = sliderConfig.slides[sliderState.currentSlideIndex];
    const sliderController = {
        sliderState,
        sliderConfig,
        sliderDispatcher: new SliderDispatcher(dispatch)
    };

    useDocumentTitleEffect(slide.title)
    useSlideTimeoutEffect(sliderController);

    return (
        <div className={'slider-container'}>
            <SliderContext.Provider value={sliderController}>
                <SlideComponent {...slide} />
                <SliderNavigation />
            </SliderContext.Provider>
        </div>
    );
}

function App() {
  return (
    <Slider slides={slides} duration={3} />
  );
}

export default App;
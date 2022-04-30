import logo from './logo.svg';
import './App.css';
import {useEffect, useLayoutEffect, useState, useRef, useReducer} from 'react';
import cn from 'classnames';

const SET_INDEX = 'SET_INDEX';
const SET_AUTO = 'SET_AUTO';
const NAVIGATE_INDEX = 'NAVIGATE_INDEX';

const slides = [
    { title: 'Elon Musk', description: 'Richest Guy', photo: 'url("slides/musk.jpeg")' },
    { title: 'Bill Gates', description: 'Founder of Microsoft', photo: 'url(slides/gates.jpeg)' },
    { title: 'Steve Jobs', description: 'Created the iPhone', photo: 'url(slides/jobs.jpeg)' },
];

function Slide({title, description, photo}) {
    return (
        <div className={'slide'} style={{backgroundImage: photo}}>
        </div>
    );
}

const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => {htmlElRef.current &&  htmlElRef.current.focus()}

    return [ htmlElRef, setFocus ]
}

function SliderBubble({i, slideIndex, navigateToSlide}) {
    const onClickBubble = (e) => {
        navigateToSlide(i)
        e.preventDefault();
    };

    const onFocusBubble = (e) => {
        if(i === slideIndex) { return; }
        navigateToSlide(i);
    };

    const [bubbleLinkRef, setBubbleLinkFocus] = useFocus();

    useEffect(() => {
        if(i === slideIndex) {
            setBubbleLinkFocus();
        }
    });

    return (
        <li
            key={i}
            className="slider-bubble"
        >
            <a
                href="#"
                ref={bubbleLinkRef}
                onClick={onClickBubble}
                onFocus={onFocusBubble}
            >{i+1}
            </a>
        </li>
    );
}

function SliderNavigation({slideIndex, isAutoSliding, duration, slideCount, auto, dispatch}) {
    const navigateToSlide = (i) => {
        dispatch({type: NAVIGATE_INDEX, i});
    };


    const slideBubbles = [];
    for(let i = 0; i < slideCount; i++) {
        slideBubbles.push(<SliderBubble i={i} key={i} slideIndex={slideIndex} navigateToSlide={navigateToSlide} />);
    }

    return (
        <div className={'slider-navigation'}>
            {auto && <SliderProgressBar key={slideIndex} duration={duration} slideIndex={slideIndex} />}
            <div className={'slider-navigation-controls'}>
                <ul className={'slider-bubbles'}>
                    {slideBubbles}
                </ul>
                <div className={'slider-spacer'}>

                </div>
                <div className={'slider-buttons'}>
                    {isAutoSliding ? <button onClick={() => dispatch({type: SET_AUTO, auto: false})}>PAUSE</button> : <button onClick={() => dispatch({type: SET_AUTO, auto: true})}>START</button>}
                    <button onClick={() => navigateToSlide(slideIndex-1)}>PREV</button>
                    <button onClick={() => navigateToSlide(slideIndex+1)}>NEXT</button>
                </div>
            </div>
        </div>
    )
}

function SliderProgressBar({duration, slideIndex}) {
    const progressBarRef = useRef(null);

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            progressBarRef.current.style.width = '100%';
        });

        return () => {
            clearTimeout(timeout);
        }
    }, [slideIndex]);

    return <div ref={progressBarRef}  className={'slider-progress'} style={{ "--interval": duration+'s'}} />
}

const useSliderReducer = (() => {
    return useReducer((state, action) => {
        const setSlideIndex = (state, action) => {
            let i = action.i;

            if(action.i === -1) {
                i = slides.length-1;
            }

            if(action.i === slides.length) {
                i = 0;
            }

            return {...state, i};
        };

        switch(action.type) {
            case SET_AUTO:
                return {...state, auto: !!action.auto}
            case NAVIGATE_INDEX:
                state = setSlideIndex(state, action);
                return {...state, auto: false}
            case SET_INDEX:
                return setSlideIndex(state, action);
            default: return state;
        }
    }, { i: 0, auto: true });
});

const useDocumentTitleEffect = (title) => {
    return useEffect(() => {
        document.title = title;
    }, [title]);
};

const useSlideTimeoutEffect = (auto,duration,i, dispatch) => {
    return useEffect(() => {
        if(!auto) { return; }

        const timeout = setTimeout(
            () => {
                dispatch({ type: SET_INDEX, i: i+1 });
            },
            duration*1000
        );

        return () => {
            clearTimeout(timeout);
        };
    }, [auto,duration,i]);
};

function Slider({slides, duration}) {
    const [{i, auto}, dispatch] = useSliderReducer();
    const slide = slides[i];

    useDocumentTitleEffect(slide.title)
    useSlideTimeoutEffect(auto,duration,i, dispatch);

    return (
        <div className={'slider-container'}>
            <Slide {...slide} />
            <SliderNavigation
                slideIndex={i}
                isAutoSliding={auto}
                dispatch={dispatch}
                auto={auto}
                slideCount={slides.length}
                duration={duration}
            />
        </div>
    );
}

function App() {
  return (
    <Slider slides={slides} duration={3} />
  );
}

export default App;


// TODO:
// PROGRESS :(
// FOCUS & keyboard navigation aka use refs OK
// REFACTOR TO USE REDUCER
// REFACTOR TO use not one big function but split it into smaller more readable ones
import logo from './logo.svg';
import './App.css';
import {useEffect, useLayoutEffect, useState, useRef} from 'react';
import cn from 'classnames';

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
        if(i === slideIndex) {
            return;
        }

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
            className={cn('slider-bubble', { active: i === slideIndex })}
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

function SliderNavigation({slideCount, slideIndex, setActiveSlide, isAutoSliding, setIsAutoSliding, duration}) {
    const navigateToSlide = (index) => {
        setIsAutoSliding(false);
        setActiveSlide(index);
    };


    const slideBubbles = [];
    for(let i = 0; i < slideCount; i++) {
        slideBubbles.push(<SliderBubble i={i} key={i} slideIndex={slideIndex} navigateToSlide={navigateToSlide} />);
    }

    return (
        <div className={'slider-navigation'}>
            <SliderProgressBar key={slideIndex} duration={duration} slideIndex={slideIndex} />
            <div className={'slider-navigation-controls'}>
                <ul className={'slider-bubbles'}>
                    {slideBubbles}
                </ul>
                <div className={'slider-spacer'}>

                </div>
                <div className={'slider-buttons'}>
                    {isAutoSliding ? <button onClick={() => setIsAutoSliding(false)}>PAUSE</button> : <button onClick={() => setIsAutoSliding(true)}>START</button>}
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

function Slider({slides, duration}) {
    const [slideIndex, setSlideIndex] = useState(0);
    const [isAutoSliding, setIsAutoSliding] = useState(1);

    const setActiveSlide = (slideIndex) => {
        if(slideIndex === -1) {
            slideIndex = slides.length-1;
        }

        if(slideIndex === slides.length) {
            slideIndex = 0;
        }

        setSlideIndex(slideIndex);
    };

    const activeSlide = slides[slideIndex];

    // run on mount/change, can compare, can unmount
    useEffect(() => {
       document.title = activeSlide.title;
    }, [slideIndex]);

    useEffect(() => {
        if(!isAutoSliding) { return; }

        const timeout = setTimeout(
            () => {
                setActiveSlide(slideIndex+1);
            },
            duration*1000
        );

        return () => {
            clearTimeout(timeout);
        };
    }, [slideIndex, duration, isAutoSliding]);

    return (
        <div className={'slider-container'}>
            <Slide {...slides[slideIndex]} />
            <SliderNavigation
                slideIndex={slideIndex}
                slideCount={slides.length}
                setActiveSlide={setActiveSlide}
                isAutoSliding={isAutoSliding}
                setIsAutoSliding={setIsAutoSliding}
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
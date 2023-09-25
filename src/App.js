/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState, useCallback } from 'react';
import { Wheel } from 'react-custom-roulette';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

import { data, eventSpin } from './utils';
import { languages } from './locales/languages';
import './App.css';
import baseService from './services/baseService';

const textColors = ['#0b3351'];
const outerBorderColor = '#FFFFFF';
const outerBorderWidth = 6;
const innerBorderColor = '#FFFFFF';
const innerBorderWidth = 20;
const innerRadius = 0;
const radiusLineColor = '#eeeeee';
const radiusLineWidth = 0;
const fontFamily = 'Nunito';
const fontWeight = 'bold';
const fontSize = 20;
const fontStyle = 'normal';
const textDistance = 60;
const spinDuration = 0.3;
const startingOptionIndex = 6;

const App = () => {
  const { width, height } = useWindowSize();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState('');
  const [chances, setChances] = useState(2);

  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang') || 'en';
  const translate = languages[lang];

  const requestNewToken = useCallback(() => {
    baseService.postMessage({ event: eventSpin.TOKEN_EXPIRED });
  }, []);

  const handleMessage = useCallback((message) => {
    try {
      const data =
        typeof message.data === 'string'
          ? JSON.parse(message.data)
          : message.data;

      if (data.type === eventSpin.NEW_TOKEN) {
        //EX: { type: 'NEW_TOKEN', data: { token: 'token____' } };
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  useEffect(() => {
    requestNewToken();
  }, [requestNewToken]);

  function handleSpinClick() {
    if (!mustSpin && chances) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      baseService.postMessage({ event: eventSpin.SPINNING });
    }
  }

  const handleSpinStop = () => {
    setMustSpin(false);
    setResult(`${prizeNumber}`);
    setChances(chances - 1);
    baseService.postMessage({
      event: eventSpin.STOP,
      data: { prizeNumber },
    });
  };

  const handleAdd = () => {
    baseService.postMessage({ event: eventSpin.ADD, data: { chances } });
  };

  const renderActionSpin = () => {
    return (
      <div className="content">
        <span className="title">{translate['title']}</span>
        <span className="chances">
          {translate['chances'].replace('${1}', chances)}
          <img
            onClick={handleAdd}
            src={require('./assets/images/add.png')}
            alt="add"
            className="icon-add"
          />
        </span>
        <span
          className="description"
          dangerouslySetInnerHTML={{ __html: translate['description'] }}
        />
        <button
          className="btn-spin"
          style={chances ? {} : { backgroundColor: 'gray' }}
          onClick={handleSpinClick}
        >
          <span className="btn-text-spin">{translate['btn_text_spin']}</span>
        </button>
      </div>
    );
  };

  const renderResultSpin = () => {
    return (
      <div className="content">
        <div className="bg-result">
          <span className="title-result">{translate['title_result']}</span>
          <span
            style={['id', 'ms'].includes(lang) ? { fontSize: '12px' } : {}}
            className="desc-result"
            dangerouslySetInnerHTML={{
              __html: translate['desc_result'].replace(
                '${1}',
                data[prizeNumber].option
              ),
            }}
          />
        </div>
        <img
          dis
          onClick={() => {
            setResult('');
          }}
          src={require('./assets/images/check.png')}
          alt="pointer"
        />
      </div>
    );
  };

  const renderWheel = () => {
    return (
      <div className="bg-wheel">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          textColors={textColors}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontStyle={fontStyle}
          outerBorderColor={outerBorderColor}
          outerBorderWidth={outerBorderWidth}
          innerRadius={innerRadius}
          innerBorderColor={innerBorderColor}
          innerBorderWidth={innerBorderWidth}
          radiusLineColor={radiusLineColor}
          radiusLineWidth={radiusLineWidth}
          spinDuration={spinDuration}
          textDistance={textDistance}
          onStopSpinning={handleSpinStop}
          disableInitialAnimation={true}
          startingOptionIndex={startingOptionIndex}
          pointerProps={{
            style: {
              width: 0,
            },
          }}
        />
      </div>
    );
  };

  const renderPointer = () => {
    return (
      <img
        className="pointer"
        src={require('./assets/images/pointer.png')}
        alt="pointer"
      />
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        {renderPointer()}
        {renderWheel()}
        {!mustSpin && !result && renderActionSpin()}
        {!!result && renderResultSpin()}
        {!!result && <Confetti width={width} height={height} />}
      </header>
    </div>
  );
};

export default App;

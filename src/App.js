import React from "react";
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo">
          <img src="logo-url" alt="Arango Logo" />
        </div>
        <h1>ARANGO</h1>
        <p>WEB 3 приложение для йогов</p>
        <p>
          Наша миссия: помогать практикующим и мастерам йоги найти друг друга,
          чтобы практиковать йогу по всему миру.
        </p>
        <p>
          Вы можете найти подходящего именно вам мастера йоги и познакомиться с
          ним онлайн
        </p>
        <button className="primary-button">Перейти в приложение</button>
      </header>

      <section className="service">
        <h2>Сервис, который мы предоставляем</h2>
        <div className="service-items">
          <div className="service-item">
            <img src="convenience-icon-url" alt="Удобство" />
            <h3>Удобство</h3>
            <p>
              Занимайтесь в комфортной домашней обстановке с проверенными
              преподавателями.
            </p>
          </div>
          <div className="service-item">
            <img src="ecosystem-icon-url" alt="Экосистема" />
            <h3>Экосистема</h3>
            <p>
              Все взаимодействие с преподавателями происходит в Telegram.
            </p>
          </div>
          <div className="service-item">
            <img src="bonuses-icon-url" alt="Бонусы за занятие" />
            <h3>Бонусы за занятие</h3>
            <p>
              Получайте бонусы за занятия, которые можно использовать на
              платформе.
            </p>
          </div>
        </div>
      </section>

      <section className="instructors">
        <h2>Инструкторы</h2>
        <div className="instructor-card">
          <img src="irina-photo-url" alt="Ирина" />
          <h3>Ирина</h3>
          <p>
            Практикую и преподаю ХиАл йогу, основанную на древнем
            обстроитном мышлении.
          </p>
          <button>Запланировать встречу</button>
        </div>
        <div className="instructor-card">
          <img src="vladimir-photo-url" alt="Владимир" />
          <h3>Владимир</h3>
          <p>
            Преподаю йогу в традиции Айенгара. Уделяю внимание правильному
            положению тела.
          </p>
          <button>Запланировать встречу</button>
        </div>
      </section>
    </div>
  );
}

export default App;

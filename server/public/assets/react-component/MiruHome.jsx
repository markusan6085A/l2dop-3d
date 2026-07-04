import './miru-home.css';

export default function MiruHome() {
  return (
    <main className="miru-home">
      <img className="miru-home__bg" src="/assets/miru-page-perfect.png" alt="" />
      <input className="miru-home__field miru-home__nick" aria-label="Ник" />
      <input className="miru-home__field miru-home__pass" aria-label="Пароль" type="password" />
      <a className="miru-home__hit miru-home__play" href="#start" aria-label="Начать игру" />
      <button className="miru-home__hit miru-home__login" aria-label="Войти в игру" />
      <a className="miru-home__hit miru-home__reg" href="#register" aria-label="Регистрация" />
      <a className="miru-home__hit miru-home__about" href="#about" aria-label="Об игре" />
      <a className="miru-home__hit miru-home__forgot" href="#forgot" aria-label="Забыли пароль" />
    </main>
  );
}

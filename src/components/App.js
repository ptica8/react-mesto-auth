import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate, Link } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import Register from './Register';
import Login from './Login';
import * as auth from './auth.js';
import {api} from '../utils/api.js';
import {CurrentUserContext} from '../contexts/CurrentUserContext';

function App() {
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isImagePopupOpen, setImagePopupOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({name: '', about: '', avatar: '', _id: ''});
    const [loggedIn, setLoggedIn] = useState(false); // false значит что когда только зашли-не залогинены
    const [userData, setUserData] = useState({
        password: '',
        email: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        handleTokenCheck();
    }, [])

    useEffect(() => {
        api.getUserInfo()
            .then((userInfo) => {
                setCurrentUser({name: userInfo.name, about: userInfo.about, avatar: userInfo.avatar, _id: userInfo._id})
            })
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        api.getAllCards()
            .then((cardsList) => {
                setCards(cardsList);
            })
            .catch(err => console.log(err));
    }, [])


    function handleTokenCheck() {
        let jwt = localStorage.getItem('jwt');
        if (jwt) {
            auth.getContent(jwt).then((res) => {
                if (res.email) {
                    localStorage.setItem('jwt', res.jwt);
                    setUserData({
                        userData: res._id,
                        email: res.email
                    })
                    setLoggedIn(true);
                    navigate('/');
                }
            });
        }
    }

        function handleCardLike(card) {
            const isLiked = card.likes.some(i => i._id === currentUser._id);
            api.changeLikeCardStatus(card._id, isLiked)
                .then((newCard) => {
                    setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
                })
                .catch(err => console.log(err));
        }

        function handleCardDelete(card) {
            api.deleteCard(card._id)
                .then(() => {
                    setCards((state) => state.filter((c) => c._id !== card._id));
                })
                .catch(err => console.log(err));
        }

        function handleUpdateUser(data) {
            api.editProfileInfo(data)
                .then(() => {
                    setCurrentUser({
                        name: data.name,
                        about: data.about,
                        avatar: currentUser.avatar,
                        _id: currentUser._id
                    })
                    closeAllPopups()
                })
                .catch(err => console.log(err));
        }

        function handleUpdateAvatar(data) {
            api.editAvatar(data)
                .then(() => {
                    setCurrentUser({
                        name: currentUser.name,
                        about: currentUser.about,
                        avatar: data.avatar,
                        _id: currentUser._id
                    })
                    closeAllPopups()
                })
                .catch(err => console.log(err));
        }

        function handleAddPlaceSubmit(data) {
            api.addNewCard(data)
                .then((newCard) => {
                    setCards([newCard, ...cards])
                    closeAllPopups()
                })
                .catch(err => console.log(err));
        }

        function handleCardClick(card) {
            setImagePopupOpen(true);
            setSelectedCard(card)
        }

        function handleEditAvatarClick() {
            setIsEditAvatarPopupOpen(true);
        }

        function handleEditProfileClick() {
            setIsEditProfilePopupOpen(true);
        }

        function handleAddPlaceClick() {
            setIsAddPlacePopupOpen(true);
        }

        function closeAllPopups() {
            setIsEditAvatarPopupOpen(false);
            setIsEditProfilePopupOpen(false);
            setIsAddPlacePopupOpen(false);
            setSelectedCard(null);
            setImagePopupOpen(false);
        }

        function handleRegister(email, password) {
            auth.register(email, password)
                .then((data) => {
                    if (data.jwt) {
                        console.log(data)
                        localStorage.setItem('jwt', data.jwt);
                        setUserData({
                            userData: data.user._id,
                            email: data.user.email
                        })
                        setLoggedIn(true);
                        navigate('/');
                    }
                })
                .catch((err) => console.log(err))
        }

        function handleLogin(email, password) {
            auth.authorize(email, password)
                .then(res => {
                    if (res.jwt) {
                        localStorage.setItem('jwt', res.jwt);
                        setUserData({
                            userData: res.user._id,
                            email: res.user.email
                        })
                        setLoggedIn(true);
                        navigate('/');
                    }
                })
                .catch((err) => console.log(err))
        }

        function handleLogOut() {

        }

        return (
            <CurrentUserContext.Provider value={currentUser}>
                <div className="page">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Header>
                                    <div>
                                        <p className="header__email">
                                            {userData.email}
                                        </p>
                                        <button className="header__exit" onClick={handleLogOut}>
                                            Выйти
                                        </button>
                                    </div>
                                </Header>
                                <ProtectedRoute
                                    path="/"
                                    component={Main}
                                    onEditAvatar={handleEditAvatarClick}
                                    onEditProfile={handleEditProfileClick}
                                    onAddPlace={handleAddPlaceClick}
                                    cardsList={cards}
                                    onCardClick={handleCardClick}
                                    onCardLike={handleCardLike}
                                    onCardDelete={handleCardDelete}
                                    loggedIn={loggedIn}
                                />
                                <Footer/>
                            </>
                            }
                        />

                        <Route path="/signup" element={
                            <>
                                <Header>
                                    <Link to="/signin" className="header__link">
                                        Войти
                                    </Link>
                                </Header>
                                <Register
                                    title="Регистрация"
                                    buttonText="Зарегистрироваться"
                                    handleRegister={handleRegister}
                                />
                            </>
                            }
                        />

                        <Route path="/signin" element={
                            <>
                                <Header>
                                    <Link to="/signup" className="header__link">
                                        Регистрация
                                    </Link>
                                </Header>
                                <Login
                                    title="Вход"
                                    buttonText="Войти"
                                    handleLogin={handleLogin}
                                />
                            </>
                            }
                        />

                        {/*<Route exact path="/" element={*/}
                        {/*    loggedIn ? (*/}
                        {/*            <Navigate to="/" />*/}
                        {/*        ) : (*/}
                        {/*            <Navigate to="/signin" />*/}
                        {/*        )*/}
                        {/*    }*/}
                        {/*/>*/}

                        {/*<Route path="*" element={*/}
                        {/*        <Navigate to="/signin" />*/}
                        {/*    }*/}
                        {/*/>*/}
                    </Routes>
                    <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups}
                                      onUpdateUser={handleUpdateUser}/>
                    <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups}
                                   onAddPlace={handleAddPlaceSubmit}/>
                    <ImagePopup
                        onClose={closeAllPopups}
                        card={selectedCard}
                        isOpen={isImagePopupOpen}
                    />
                    <section className="popup popup_type_delete">
                        <div className="popup__container">
                            <h2 className="popup__confirm">Вы уверены?</h2>
                            <button className="popup__button" type="submit">
                                Да
                            </button>
                            <button
                                className="popup__close"
                                type="button"
                                aria-label="Закрыть форму"
                            />
                        </div>
                    </section>
                    <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups}
                                     onUpdateAvatar={handleUpdateAvatar}/>
                </div>
            </CurrentUserContext.Provider>
        )
}

export default App;

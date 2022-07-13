import { useEffect, useState } from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
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

    useEffect(() => {
        api.getUserInfo()
            .then((userInfo) => {setCurrentUser ({name: userInfo.name, about: userInfo.about, avatar: userInfo.avatar, _id: userInfo._id})})
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        api.getAllCards()
            .then((cardsList) => {
                setCards(cardsList);
            })
            .catch(err => console.log(err));
    }, [])

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
                setCurrentUser({name: data.name, about: data.about, avatar: currentUser.avatar, _id: currentUser._id})
                closeAllPopups()
            })
            .catch(err => console.log(err));
    }

    function handleUpdateAvatar(data) {
        api.editAvatar(data)
            .then(() => {
                setCurrentUser({name: currentUser.name, about: currentUser.about, avatar: data.avatar, _id: currentUser._id})
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

    return (
      <div className="page">
          <Header />
          <CurrentUserContext.Provider value={currentUser}>
              <Main
                  onEditAvatar={handleEditAvatarClick}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  cardsList={cards}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
              >
              </Main>
          <Footer />
              <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
          </CurrentUserContext.Provider>
          <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} />
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

          <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
      </div>
  )
}

export default App;

// Sélectionne les éléments HTML
const valueDisplay = document.getElementById("valueBr");
const raiseBtn = document.getElementById("raiseBtn");
const checkBtn = document.getElementById("checkBtn");
const infosGame = document.getElementById("infosGame");
const playerContainer = document.getElementById("playerCards");
const dealerContainer = document.getElementById("dealerCards");
const chipsContainer = document.getElementById("chipsBlinds");
const raiseContainer = document.getElementById("chipsRaise");
const replayBtn = document.getElementById("replayBtn");

/* INITIALISE les valeurs importantes tout au long de la partie */
let br = 990;
let bet = 0;
let bb = 5;
let isCheckOk = false;
let isRaised = false;

//audio
const winBonusAudio = document.getElementById("winBonusAudio");
const winAudio = document.getElementById("winAudio");
const loseAudio = document.getElementById("loseAudio");
const tieAudio = document.getElementById("tieAudio");
const restartAudio = document.getElementById("restartAudio");
const raiseAudio = document.getElementById("raiseAudio");
const checkAudio = document.getElementById("checkAudio");
let soundEnabled = true; // Variable globale pour gérer l'état des sons

const playSound = (audioElement) => {
  if (soundEnabled) {
    audioElement.currentTime = 0; // Réinitialiser la position de lecture
    audioElement.play().catch((error) => {
      console.error("Erreur lors de la lecture de l'audio :", error);
    });
  }
};

const playWinBonusAudio = () => playSound(winBonusAudio);

const playWinAudio = () => playSound(winAudio);

const playLoseAudio = () => playSound(loseAudio);

const playTieAudio = () => playSound(tieAudio);

const playRestartAudio = () => playSound(restartAudio);

const playRaiseAudio = () => playSound(raiseAudio);

const playCheckAudio = () => playSound(checkAudio);

// Fonction pour activer/désactiver les sons
const toggleSound = () => {
  soundEnabled = !soundEnabled;
  const toggleSoundBtn = document.getElementById("toggleSoundBtn");
  toggleSoundBtn.textContent = soundEnabled ? "S : ON" : "S : OFF";
};

let cartesJ = {
  hauteurA: 0,
  typeA: 0,
  hauteurB: 0,
  typeB: 0,
};

let cartesC = {
  hauteurA: 14,
  typeA: 5,
  hauteurB: 14,
  typeB: 5,
};

/* FIN INIT */

// Fonctions raise
const raise = () => {
  isRaised = true;
  if (isCheckOk) {
    //Croupier a retourné une carte
    br -= 5;
    bet += 5;
    valueDisplay.textContent = br;
    raiseAnim(isCheckOk);
    infosGame.innerHTML += `<br>Raise: ${bet}<br>Le croupier retourne l'autre carte.`; //affiche les informations durant la partie
    replayBtnAppear(); //pour éviter que joueur raise pendant l'animation
    setTimeout(() => {
      creerCarteDroite(cartesC);
      afficherCartes(cartesC, "dealerCards"); //cartes du croupier créées et affichées
      afficherWinner(cartesJ, cartesC);
      isCheckOk = false;
    }, 1000);
  } else {
    // croupier n'a pas encore retourné de carte
    br -= 10;
    bet += 10;
    valueDisplay.textContent = br;
    raiseAnim(isCheckOk);
    infosGame.innerHTML += `<br>Raise: ${bet}<br>Le croupier retourne ses cartes.`; //affiche les informations durant la partie
    replayBtnAppear(); //pour éviter que joueur raise pendant l'animation
    setTimeout(() => {
      creerCartesRandom(cartesC);
      afficherCartes(cartesC, "dealerCards"); //cartes du croupier créées et affichées
      afficherWinner(cartesJ, cartesC);
    }, 1000); // 1000 ms = 1 seconde
  }
  playRaiseAudio();
};

// Fonctions raise
const check = () => {
  if (isCheckOk) {
    //Le croupier a déjà retourné une carte
    infosGame.innerHTML += `<br>Check:<br>Le croupier retourne sa deuxième carte.`; //affiche les informations durant la partie
    replayBtnAppear(); //pour éviter que joueur raise pendant l'animation
    creerCarteDroite(cartesC);
    afficherCartes(cartesC, "dealerCards"); //carte du croupier créée et affichée
    afficherWinner(cartesJ, cartesC);
    isCheckOk = false;
  } else {
    //le croupier n'a pas encore retourné de carte
    infosGame.innerHTML += `<br>Check:<br>Le croupier retourne une carte.`; //affiche les informations durant la partie
    creerCarteGauche(cartesC);
    afficherCartes(cartesC, "dealerCards"); //carte du croupier créée et affichée
    isCheckOk = true;
  }
  playCheckAudio();
};

//fonction qui affiche le gagnant du coup ainsi que sa main ET ajoute les gains à la roll du joueur
const afficherWinner = (cartesJ, cartesC) => {
  if (comparerMains(cartesJ, cartesC) == 2) {
    const bonus = addBonus(cartesJ);

    infosGame.innerHTML += `<br>Bravo ! Vous gagnez :<br> <b>${
      bet + bb + (bonus > 0 ? " + un bonus de " + bonus : 0)
    } pour votre ${afficherNameHand(cartesJ)}.</b> <br>Voulez-vous rejouer ?`; // affiche les informations durant la partie
    br += bet + bet + 3 * bb + addBonus(cartesJ);

    /*Lecture audio victoire*/
    if (addBonus(cartesJ) > 0) {
      playWinBonusAudio();
    } else {
      playWinAudio();
    }
    /**/
    paymentAnim(isRaised, isCheckOk, bonus); //animation des chips de paiement
  } else if (comparerMains(cartesJ, cartesC) == 1) {
    infosGame.innerHTML += `<br>Egalité ! Vous récupérez votre mise.
    <br>Voulez-vous rejouer ?`; //affiche les informations durant la partie
    br += bet + 2 * bb;
    playTieAudio();
  } else {
    infosGame.innerHTML += `<br>Le croupier a une meilleure main, dommage !
    <br>Voulez-vous rejouer ?`; //affiche les informations durant la partie
    loseAnim();
    playLoseAudio();
  }
  valueDisplay.textContent = br;
};

const afficherNameHand = (cartesJ) => {
  const hauteurs = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A",
    "X",
  ]; // Mapping of type numbers to letters
  if (isPairedSuited(cartesJ)) {
    return "Paire suitée de " + hauteurs[cartesJ.hauteurA - 1];
  } else if (isPaired(cartesJ)) {
    return "Paire de " + hauteurs[cartesJ.hauteurA - 1];
  } else if (isSuited(cartesJ)) {
    return (
      "Hauteur " +
      hauteurs[cartesJ.hauteurA - 1] +
      hauteurs[cartesJ.hauteurB - 1] +
      " suitée"
    );
  } else {
    return (
      "Hauteur " +
      hauteurs[cartesJ.hauteurA - 1] +
      hauteurs[cartesJ.hauteurB - 1]
    );
  }
};

const addBonus = (cartesJ) => {
  if (isPairedSuited(cartesJ)) {
    if (cartesJ.hauteurA == 13) {
      return 50 * bb;
    } else if (cartesJ.hauteurA == 12) {
      return 20 * bb;
    } else if (cartesJ.hauteurA == 11) {
      return 15 * bb;
    } else if (cartesJ.hauteurA == 10) {
      return 10 * bb;
    } else if (cartesJ.hauteurA == 9) {
      return 10 * bb;
    } else if (cartesJ.hauteurA == 8) {
      return 9 * bb;
    } else if (cartesJ.hauteurA == 7) {
      return 8 * bb;
    } else if (cartesJ.hauteurA == 6) {
      return 7 * bb;
    } else if (cartesJ.hauteurA == 5) {
      return 6 * bb;
    } else if (cartesJ.hauteurA == 4) {
      return 5 * bb;
    } else if (cartesJ.hauteurA == 3) {
      return 4 * bb;
    } else if (cartesJ.hauteurA == 2) {
      return 3 * bb;
    } else if (cartesJ.hauteurA == 1) {
      return 2 * bb;
    }
  } else if (isPaired(cartesJ)) {
    return bb;
  }
  return 0;
};

//Fait apparaître le bouton "rejouer" et disparaitre les deux autres
const replayBtnAppear = () => {
  // Masquer les boutons "Raise", "Check"
  raiseBtn.classList.add("hidden");
  checkBtn.classList.add("hidden");
  setTimeout(() => {
    replayBtn.classList.remove("hidden");
    replayBtn.classList.add("bouton");
  }, 1000);
};

//Fonction Comparer mains
const comparerMains = (cartesJ, cartesC) => {
  //Vérifie les conditions pour joueur
  if (isPairedSuited(cartesJ)) {
    if (isPairedSuited(cartesC)) {
      //Tout les deux pairés et suités !!!
      //Egalité de force, qui a la meilleure pps ?
      if (cartesJ.hauteurA > cartesC.hauteurA) {
        return 2;
      } else if (cartesJ.hauteurA < cartesC.hauteurA) {
        return 0;
      } else {
        return 1; //Egalité (extrêmement rare)
      }
    } else {
      return 2; //Joueur est gagnant car il a une pps & croupier a forcément moins bien
    }
  } else if (isPaired(cartesJ)) {
    //joueur a une pp
    if (isPairedSuited(cartesC)) {
      return 0; //croupier gagne forcément car il a une pps (mieux)
    } else if (isPaired(cartesC)) {
      //les deux ont une pp, qui a la meilleure ?
      if (cartesJ.hauteurA > cartesC.hauteurA) {
        return 2;
      } else if (cartesJ.hauteurA < cartesC.hauteurA) {
        return 0;
      } else {
        return 1;
      }
    } else {
      //croupier a forcément moins bien car il n'a ni pps ni pp
      return 2;
    }
  } else if (isSuited(cartesJ)) {
    //si joueur a une suited
    if (isPairedSuited(cartesC) || isPaired(cartesC)) {
      return 0; //croupier a pp ou pps donc mieux, perdu pour le joueur
    } else if (isSuited(cartesC)) {
      //égalité de force, on vérifie qui a la meilleure hauteur
      // on tri d'abord pour simplifier l'arbre
      trierHauteursCartes(cartesJ);
      trierHauteursCartes(cartesC);
      if (cartesJ.hauteurA > cartesC.hauteurA) {
        return 2; //Joueur a meilleure main suited
      } else if (cartesJ.hauteurA < cartesC.hauteurA) {
        return 0; //croupier en a une meilleure : perdu
      } else {
        return sameHighCompared(cartesJ, cartesC); //même hauteur, on vérifie le kicker avec cette fonction qui renvoie 2,1 ou 0.
      }
    } else {
      //croupier a une off et a donc moins bien
      return 2;
    }
  } else {
    //les trois conditions ont été vérifiée : joueur a forcément une main off
    if (isPairedSuited(cartesC) || isPaired(cartesC) || isSuited(cartesC)) {
      return 0; //croupier a mieux : perdu pour le joueur
    } else {
      //croupier a une main off : cas le plus récurrent. On vérifie les hauteurs
      //d'abord on tri pour mieux s'y retrouver
      trierHauteursCartes(cartesJ);
      trierHauteursCartes(cartesC);
      if (cartesJ.hauteurA > cartesC.hauteurA) {
        return 2; //Joueur a meilleure main off
      } else if (cartesJ.hauteurA < cartesC.hauteurA) {
        return 0; //croupier en a une meilleure : perdu
      } else {
        return sameHighCompared(cartesJ, cartesC); //même hauteur, on vérifie le kicker avec cette fonction qui renvoie 2,1 ou 0.
      }
    }
  }
};

const isPairedSuited = (cartes) => {
  if (cartes.hauteurA == cartes.hauteurB && cartes.typeA == cartes.typeB) {
    return true;
  }
  return false;
};
const isPaired = (cartes) => {
  if (cartes.hauteurA == cartes.hauteurB && cartes.typeA != cartes.typeB) {
    return true;
  }
  return false;
};
const isSuited = (cartes) => {
  if (cartes.hauteurA != cartes.hauteurB && cartes.typeA == cartes.typeB) {
    return true;
  }
  return false;
};

const trierHauteursCartes = (cartes) => {
  if (cartes.hauteurA > cartes.hauteurB) {
    return cartes;
  } else {
    let tempCartes = Object.assign({}, cartes);
    tempCartes.hauteurA = cartes.hauteurB;
    tempCartes.typeA = cartes.typeB;
    cartes.hauteurB = cartes.hauteurA;
    cartes.typeB = cartes.typeA;
    cartes.hauteurA = tempCartes.hauteurA;
    cartes.typeA = tempCartes.typeA;
    return cartes;
  }
};

//Les deux ont la même hauteur, on vérifie le kicker (cas pour suited et off)
const sameHighCompared = (cartesJ, cartesC) => {
  if (cartesJ.hauteurB > cartesC.hauteurB) {
    return 2; //meilleur kicker chez joueur, on renvoie 2
  } else if (cartesJ.hauteurB < cartesC.hauteurB) {
    return 0; //meilleur kicker chez croupier
  } else {
    return 1; //même kicker chez les deux : égalité
  }
};

const creerCartesRandom = (cartes) => {
  /*hauteurs :  1 = 2, ..., 13 = As
    type : 1 = c, 2 = s, 3 = d, 4 = h */
  cartes.hauteurA = Math.random() * 13 + 1;
  cartes.hauteurA = Math.floor(cartes.hauteurA);
  cartes.typeA = Math.random() * 4 + 1;
  cartes.typeA = Math.floor(cartes.typeA);
  cartes.hauteurB = Math.random() * 13 + 1;
  cartes.hauteurB = Math.floor(cartes.hauteurB);
  cartes.typeB = Math.random() * 4 + 1;
  cartes.typeB = Math.floor(cartes.typeB);
  return cartes;
};

const creerCarteGauche = (cartes) => {
  /*hauteurs :  1 = 2, ..., 13 = As
    type : 1 = c, 2 = s, 3 = d, 4 = h */
  cartes.hauteurA = Math.random() * 13 + 1;
  cartes.hauteurA = Math.floor(cartes.hauteurA);
  cartes.typeA = Math.random() * 4 + 1;
  cartes.typeA = Math.floor(cartes.typeA);
  return cartes;
};

const creerCarteDroite = (cartes) => {
  /*hauteurs :  1 = 2, ..., 13 = As
      type : 1 = c, 2 = s, 3 = d, 4 = h */
  cartes.hauteurB = Math.random() * 13 + 1;
  cartes.hauteurB = Math.floor(cartes.hauteurB);
  cartes.typeB = Math.random() * 4 + 1;
  cartes.typeB = Math.floor(cartes.typeB);
  return cartes;
};

const afficherCartes = (cartes, locationId) => {
  const hauteurs = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A",
    "X",
  ]; // Mapping of type numbers to letters
  const types = ["c", "s", "d", "h", "x"]; // Mapping of type numbers to letters

  const imgA = document.createElement("img");
  imgA.src = `./assets/img/${hauteurs[cartes.hauteurA - 1]}${
    types[cartes.typeA - 1]
  }.gif`;
  imgA.classList.add("card-image"); // Ajouter la classe CSS
  playerContainer.appendChild(imgA);

  const imgB = document.createElement("img");
  imgB.src = `./assets/img/${hauteurs[cartes.hauteurB - 1]}${
    types[cartes.typeB - 1]
  }.gif`;
  imgB.classList.add("card-image"); // Ajouter la classe CSS
  playerContainer.appendChild(imgB);
  if (locationId == "playerCards") {
    playerContainer.innerHTML = ""; // Clear previous images
    playerContainer.appendChild(imgA);
    playerContainer.appendChild(imgB);
  } else {
    dealerContainer.innerHTML = ""; // Clear previous images
    dealerContainer.appendChild(imgA);
    dealerContainer.appendChild(imgB);
  }
};

const raiseAnim = (isCheckOk) => {
  const chipsRaise = document.createElement("img");
  chipsRaise.src = `./assets/img/chips.png`;
  chipsRaise.classList.add("chip-image"); // Ajouter la classe CSS
  raiseContainer.appendChild(chipsRaise);
  if (!isCheckOk) {
    const chipsRaise2 = document.createElement("img");
    chipsRaise2.src = `./assets/img/chips.png`;
    chipsRaise2.classList.add("chip-image", "offset"); // Ajouter les classes CSS pour le décalage
    raiseContainer.appendChild(chipsRaise2);
  }
};

const paymentAnim = (isRaised, isCheckOk, bonus) => {
  //blinde payée quoi qu'il arrive
  const chipsPaid = document.createElement("img");
  chipsPaid.src = `./assets/img/chips.png`;
  chipsPaid.classList.add("chip-image"); // Ajouter la classe CSS
  chipsContainer.appendChild(chipsPaid);
  //si joueur a raise, 1er jeton raise payé
  if (isRaised) {
    const chipsRaisePaid1 = document.createElement("img");
    chipsRaisePaid1.src = `./assets/img/chips.png`;
    chipsRaisePaid1.classList.add("chip-image"); // Ajouter la classe CSS
    raiseContainer.appendChild(chipsRaisePaid1);
    //2eme s'il a raise à 0C
    if (!isCheckOk) {
      const chipsRaisePaid2 = document.createElement("img");
      chipsRaisePaid2.src = `./assets/img/chips.png`;
      chipsRaisePaid2.classList.add("chip-image"); // Ajouter la classe CSS
      raiseContainer.appendChild(chipsRaisePaid2);
    }
  }
  //cas du bonus EN STAND BY LE TEMPS QUE JE FASSE LA FONCTION DE CALCUL DE MODULO
  if (bonus > 0) {
    displayChipsValues(bonus);
  }
};

const displayChipsValues = (bonus) => {
  const r = [0, 0, 0]; //0 pour les 100, 1 pour les 25 et 2 pour les 5

  let remainingBonus = bonus;

  // Calculer le nombre de jetons de 100
  r[0] = Math.floor(remainingBonus / 100);
  remainingBonus %= 100;

  // Calculer le nombre de jetons de 25
  r[1] = Math.floor(remainingBonus / 25);
  remainingBonus %= 25;

  // Calculer le nombre de jetons de 5
  r[2] = Math.floor(remainingBonus / 5);
  remainingBonus %= 5;

  // Fonction pour ajouter des images de jetons
  const addChips = (count, src) => {
    for (let i = 0; i < count; i++) {
      const chip = document.createElement("img");
      chip.src = src;
      chip.classList.add("chip-image");
      chipsContainer.appendChild(chip);
    }
  };

  // Ajouter les jetons de 100
  addChips(r[0], `./assets/img/chips100.png`);

  // Ajouter les jetons de 25
  addChips(r[1], `./assets/img/chips25.png`);

  // Ajouter les jetons de 5
  addChips(r[2], `./assets/img/chips.png`);

  //   console.log(`Jetons de 100 : ${r[0]}`);
  //   console.log(`Jetons de 25 : ${r[1]}`);
  //   console.log(`Jetons de 5 : ${r[2]}`);
  //   console.log(`Reste : ${remainingBonus}`); // Ce qui reste, s'il y a une somme qui ne peut pas être divisée par 5

  return r; // Si tu veux retourner le tableau des valeurs des jetons
};

const loseAnim = () => {
  chipsContainer.innerHTML = "";
  raiseContainer.innerHTML = "";
};

const afficherChips = () => {
  const chipsBb = document.createElement("img");
  const chipsAnte = document.createElement("img");
  chipsBb.src = `./assets/img/chips.png`;
  chipsAnte.src = `./assets/img/chips.png`;
  chipsBb.classList.add("chip-image"); // Ajouter la classe CSS
  chipsAnte.classList.add("chip-image"); // Ajouter la classe CSS
  chipsContainer.innerHTML = ""; // Clear previous images
  chipsContainer.appendChild(chipsBb);
  chipsContainer.appendChild(chipsAnte);
};

// Ajoute un événement de clic au bouton Raise
replayBtn.addEventListener("click", () => {
  // Réinitialiser les états de jeu ici
  infosGame.innerHTML = "";
  bet = 0; //réinitialiser raise à 0
  br -= 10; //blinde + ante
  restartGame();
});

const restartGame = () => {
  // Masquer le bouton "Rejouer"
  replayBtn.classList.add("hidden");

  // Afficher les boutons "Raise", "Check"
  raiseBtn.classList.remove("hidden");
  checkBtn.classList.remove("hidden");

  // Logique pour commencer une nouvelle partie
  cartesJ = creerCartesRandom(cartesJ);
  cartesC = {
    hauteurA: 14,
    typeA: 5,
    hauteurB: 14,
    typeB: 5,
  };
  afficherCartes(cartesJ, "playerCards");
  afficherCartes(cartesC, "dealerCards");
  afficherChips();
  isRaised = false;
  raiseContainer.innerHTML = ""; // Clear raise animation
  valueDisplay.textContent = br;
  infosGame.innerHTML = `Blinde et ante : 5-5.`; //affiche les informations durant la partie
  playRestartAudio();
};

/*----- MAIN -----*/
// Ajouter un écouteur d'événement pour le bouton d'activation/désactivation des sons
document
  .getElementById("toggleSoundBtn")
  .addEventListener("click", toggleSound);

raiseBtn.addEventListener("click", raise);
checkBtn.addEventListener("click", check);
cartesJ = creerCartesRandom(cartesJ);

/* TEST 
//Test cartes joueurs au démarrage
cartesJ = {
  hauteurA: 11,
  typeA: 4,
  hauteurB: 11,
  typeB: 4,
};
 FIN TEST */

afficherCartes(cartesJ, "playerCards");
afficherCartes(cartesC, "dealerCards");
afficherChips();
infosGame.innerHTML = `Blinde et ante : 5-5.`; //affiche les informations durant la partie

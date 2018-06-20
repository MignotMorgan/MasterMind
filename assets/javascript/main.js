let canvas;
let ctx;
let intervalID;
let mouse = {X:0, Y:0, position:null};
let plateau;
let listColors = [ 'blue', 'green', 'yellow', 'red', 'orange', 'purple'];
let gagner = false;
let perdu = false;
let solution = false;

/**Dimension des Interface */
let width = 1750;
let height = 800;
let rec_Plateau = {x:50, y:50, width:700, height:700};
let rec_Info = {x:1000, y:50, width:700, height:700};
let rec_Restart = {x:800, y:50, width:150, height:50};
let rec_Clean = {x:800, y:150, width:150, height:50};
let rec_Solution = {x:800, y:250, width:150, height:50};

/**Boutons */
let btnRestart;
let btnClean;
let btnSolution;

/**Images */
imgPlateau = new Image();
imgPlateau.src = "assets/images/plateau.jpg";
let imgBackground = new Image();
imgBackground.src="assets/images/background.jpg";
let imgPlay = new Image();
imgPlay.src="assets/images/background_01.jpg";
let imgGagner = new Image();
imgGagner.src = "assets/images/gagner.jpg";
let imgPerdu = new Image();
imgPerdu.src = "assets/images/perdu.jpg";
let imgEngrenage = new Image();
imgEngrenage.src = "assets/images/SP_Engrenage_01.png";
let imgButton = new Image();
imgButton.src = "assets/images/SP_Texture_01.jpg";

/**Sounds */
let soundStart;
let soundHover = new Audio('assets/sounds/hover.mp3');
let soundMise = new Audio('assets/sounds/mise.mp3');
let soundGameOver = new Audio('assets/sounds/gameOver.mp3');
let soundWin = new Audio('assets/sounds/win.mp3');

/**Déplacement de la souris dans le canvas */
const moveCanvas = (e)=>{
  mouse.position = canvas.getBoundingClientRect();
  mouse.X = e.clientX-mouse.position.left;
  mouse.Y = e.clientY-mouse.position.top;
  if(plateau.contains(mouse.X, mouse.Y))
    plateau.hoverOn(mouse.X, mouse.Y);
  else
    plateau.hoverOff(mouse.X, mouse.Y);

  if(btnRestart.contains(mouse.X, mouse.Y))
    btnRestart.hoverOn(mouse.X, mouse.Y);
  else
    btnRestart.hoverOff(mouse.X, mouse.Y);
  if(btnRestart.contains(mouse.X, mouse.Y))
    btnRestart.hoverOn(mouse.X, mouse.Y);
  else
    btnRestart.hoverOff(mouse.X, mouse.Y);

    if(btnClean.contains(mouse.X, mouse.Y))
      btnClean.hoverOn(mouse.X, mouse.Y);
    else
      btnClean.hoverOff(mouse.X, mouse.Y);  

    if(btnSolution.contains(mouse.X, mouse.Y))
      btnSolution.hoverOn(mouse.X, mouse.Y);
    else
      btnSolution.hoverOff(mouse.X, mouse.Y);    
}
/**Dessine le canvas */
const drawCanvas = () =>
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(imgBackground, 0, 0, width, height);

  plateau.draw();
  
  if(gagner)
  {
    ctx.drawImage(imgGagner, rec_Info.x, rec_Info.y, rec_Info.width, rec_Info.height);
  }
  else if(perdu)
  {
    ctx.drawImage(imgPerdu, rec_Info.x, rec_Info.y, rec_Info.width, rec_Info.height);
  }
  else
  {
    ctx.drawImage(imgPlay, rec_Info.x, rec_Info.y, rec_Info.width, rec_Info.height);
    shadow(rec_Info.x, rec_Info.y, rec_Info.width, rec_Info.height);
    shadow(rec_Plateau.x, rec_Plateau.y, rec_Plateau.width, rec_Plateau.height);
  }

  btnRestart.draw();
  btnClean.draw();
  btnSolution.draw();
}
/**Click sur le canvas */
const clickCanvas = (e) =>
{
  if(plateau.contains(mouse.X, mouse.Y))
    plateau.click(mouse.X, mouse.Y);
  if(btnRestart.contains(mouse.X, mouse.Y))
    btnRestart.click(mouse.X, mouse.Y);
  if(btnClean.contains(mouse.X, mouse.Y))
    btnClean.click(mouse.X, mouse.Y);
  if(btnSolution.contains(mouse.X, mouse.Y))
    btnSolution.click(mouse.X, mouse.Y);
}
/**Dessine les résultat */
const circlePion = (pion) =>
{
  circle(pion.x, pion.y, pion.size, pion.fillColor, pion.strokeColor);
}
/**Dessine un cercle */
const circle = (x, y, size, fillColor, strokeColor, lineWidth) =>
{
  ctx.beginPath();
  ctx.lineWidth=lineWidth;
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
}
/**Applique une ombre sur une partie du canvas */
const shadow = (x, y, width, height) =>
{
  let startShadow = plateau.current.y+plateau.current.height;
  let s = solution?plateau.solution.height:0;
  let imageData = ctx.getImageData(x, startShadow, width, height-(startShadow-y)-s);
  let pixels = imageData.data;
  let nbPixels = pixels.length;
  
  for(var i=0; i<nbPixels; i++)
  {
    average = (pixels[i*4] + pixels[i*4+1] + pixels[i*4+2]) / 25;
  
      pixels[i*4] = average;
      pixels[i*4+1] = average;
      pixels[i*4+2] = average;

      // On n'y touche pas car on ne veut pas appliquer de transparence
      // pixels[i*4+3] = pour l'alpha
  }  
  ctx.putImageData(imageData, x, startShadow);
}


/**fonction button */
const restartFunction = () =>
{
  gagner = false;
  perdu = false;
  solution = false;

  let nbrColonne = parseInt(prompt("Entrez le nombre de colonne"));
  if(!Number.isInteger(nbrColonne) || nbrColonne < 0 || nbrColonne > 8)nbrColonne = 4;
  let nbrLigne = parseInt(prompt("Entrez le nombre de lignes"));
  if(!Number.isInteger(nbrLigne) || nbrLigne < 0 || nbrLigne > 9)nbrLigne = 9;
  let nbrColor = parseInt(prompt("Entrez le nombre de colonne"));
  if(!Number.isInteger(nbrColor) || nbrColor < 0 || nbrColor > 6)nbrColor = 4;
  plateau.commencer(nbrColonne, nbrLigne, nbrColor);
}
const solutionFunction = () =>
{
  solution = !solution;
}
const cleanFunction = () =>
{
  if(!gagner && !perdu)
    plateau.current.clean();
}
const gagnerFunction = () =>
{

}
const randomImage = () =>
{
  
}
/**Fonction de lancement du jeu à la fin du chargement de la page */
window.load = new function()
{
    /**Création du canvas */
    canvas = document.createElement('canvas');//créer l'élément canvas
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);//ajoute le canvas dans la balise body
    canvas.classList.add("canvas");// ajoute la class canvas à l'élément canvas
    ctx = canvas.getContext('2d');//selectionne le context de l'élément canvas
    
    /**ajoute d'évènement à l'élément canvas */
    canvas.addEventListener('mousemove', moveCanvas);
    canvas.addEventListener('click', clickCanvas);

    /**plateau du jeu */
    plateau = new Plateau(rec_Plateau.x, rec_Plateau.y, rec_Plateau.width, rec_Plateau.height);

    /**ouverture des prompt */
    let nbrColonne = parseInt(prompt("Entrez le nombre de colonne"));
    if(!Number.isInteger(nbrColonne) || nbrColonne < 0 || nbrColonne > 8)nbrColonne = 4;
    let nbrLigne = parseInt(prompt("Entrez le nombre de lignes"));
    if(!Number.isInteger(nbrLigne) || nbrLigne < 0 || nbrLigne > 9)nbrLigne = 9;
    let nbrColor = parseInt(prompt("Entrez le nombre de couleur"));
    if(!Number.isInteger(nbrColor) || nbrColor < 0 || nbrColor > 6)nbrColor = 4;
    /**Commencer le jeu */
    plateau.commencer(nbrColonne, nbrLigne, nbrColor);

    /**Bouton */
    btnRestart = new Button(rec_Restart.x, rec_Restart.y, rec_Restart.width, rec_Restart.height, "Restart", restartFunction);
    btnClean = new Button(rec_Clean.x, rec_Clean.y, rec_Clean.width, rec_Clean.height, "Clean", cleanFunction);
    btnSolution = new Button(rec_Solution.x, rec_Solution.y, rec_Solution.width, rec_Solution.height, "Solution", solutionFunction);
    
    let intervalID = window.setInterval(drawCanvas, 50);//execute la fonction Draw toutes les x millisecondes

    soundStart = new Audio('assets/sounds/start.mp3').play();
    
}

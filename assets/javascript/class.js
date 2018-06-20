/**Classe de base pour l'affichage des éléments du jeu */
class Interface
{
    constructor(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    contains(x, y)
    {
        return this.x <= x && x <= this.x+this.width
            && this.y <= y && y <= this.y+this.height;
    }
    clearCtx()
    {
        ctx.strokeStyle="black";
        ctx.fillStyle="black";
        ctx.lineWidth='2';  
    }
}
/**Plateau du jeu */
class Plateau extends Interface
{    
    constructor(x, y, width, height)
    {
        super(x, y, width, height);
        this.commencer();
    }
    commencer(nbrColonne = 4, nbrLigne = 9, nbrColor = 4)
    {
        this.nbrColonne = nbrColonne;
        this.nbrLigne = nbrLigne;
        this.nbrColor = nbrColor <= 6 ? nbrColor : 6;

        let colorHeight = this.width/this.nbrColor;// < 200 ? this.width/this.nbrColor : 200;
        this.colors = new Colors(this.x, this.y, this.width, colorHeight, this.nbrColor);

        this.comparesolution = [];
        this.comparecurrent = [];
        this.cleanSolution();

        this.solution = this.addSolution();

        this.lignes = [];
        this.addLigne();
    }
    chercheSolution()
    {
        let tab = []
        for(let i = 0; i < this.nbrColonne; i++)
        {
            tab.push(this.randColor());
        }
        return tab;
    }
    verifSolution()
    {
        for(let i = 0; i < this.nbrColonne; i++)
        {
            if(this.solution.colonnes[i] != this.current.colonnes[i])
                return false;
        }
        return true;
    }
    compareSolution()
    {
        for(let i = 0; i < this.solution.colonnes.length; i++)
        {
            if(this.solution.colonnes[i] === this.current.colonnes[i])
            {
                this.current.addNoir();
                this.comparesolution[i] = false;
                this.comparecurrent[i] = false;
            }
        }
        for(let i = 0; i < this.solution.colonnes.length; i++)
        {
            if(this.comparesolution[i])
                for(let b = 0; b < this.current.colonnes.length; b++)
                {
                    if(this.comparecurrent[b] && this.solution.colonnes[i] === this.current.colonnes[b])
                    {
                        this.current.addBlanc();
                        this.comparecurrent[b] = false;
                        break;
                    }
                }
        }
        this.cleanSolution();
    }
    cleanSolution()
    {
        this.comparesolution = [];
        this.comparecurrent = [];
        for(let i = 0; i < this.nbrColonne; i++)
        {
            this.comparesolution.push(true);
            this.comparecurrent.push(true);
        }
    }
    randColor()
    {
        return Math.floor(Math.random()*this.nbrColor);
    }
    addLigne()
    {
        let colorHeight = this.colors.height;// this.width/this.nbrColor;
        let ligneHeight = (this.height-colorHeight)/(this.nbrLigne+1);
        this.lignes.push(this.current = new ligne(this.x, this.y+colorHeight+(ligneHeight*(this.lignes.length)), this.width, ligneHeight, this.nbrColonne));
    }
    addSolution()
    {
        let colorHeight = this.colors.height;// this.width/this.nbrColor;
        let ligneHeight = (this.height-colorHeight)/(this.nbrLigne+1);
        return new Solution(this.x, this.y+this.height-ligneHeight, this.width, ligneHeight, this.chercheSolution());
    }

    gagner()
    {
        soundWin.play();
        gagner = true;
    }
    perdu()
    {
        soundGameOver.play();
        perdu = true;
    }

    draw()
    {
        this.clearCtx();
        ctx.drawImage(imgPlateau, this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.stroke();

        if(this.colors != null)
            this.colors.draw();
        for(let i = 0; i < this.lignes.length; i++)
            this.lignes[i].draw();
        if(this.solution != null)
            this.solution.draw();
    }
    click(x, y)
    {
        if(this.colors.contains(x, y))
        {
            this.colors.click(x, y);
            this.current.addColor(this.colors.selected);

            if(this.current.colonnes.length === this.nbrColonne)
            {
                if(this.verifSolution())
                    this.gagner();
                else if( this.lignes.length === this.nbrLigne)
                    this.perdu();
                else
                {
                    this.compareSolution();
                    this.addLigne();
                }
            }
        }
    }
    hoverOn(x, y)
    {
        if(this.colors.contains(x, y))
            this.colors.hoverOn(x, y);
        else    
            this.colors.hoverOff(x, y);      
    }
    hoverOff(x, y)
    {
        this.colors.hoverOff(x, y);       
    }
}

class Colors extends Interface
{
    constructor(x, y, width, height, nbrColor)
    {
        super(x, y, width, height);
        this.nbrColor = nbrColor;
        this.selected = 0;
        this.hoverSelected = -1;
    }
    draw()
    {
        this.clearCtx();
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        let size = this.height/2;
        for(let i = 0; i < this.nbrColor; i++)
        {
            circle(this.x+size+(size*2*i), this.y+size, size*0.7, listColors[i], this.hoverSelected==i?"black":"grey", "10");
        }
    }
    click(x, y)
    {
        soundMise.play();
        this.selected = Math.floor((x-this.x)/(this.width/this.nbrColor));
    }
    hoverOn(x, y)
    {
        soundHover.play();
        this.hoverSelected = Math.floor((x-this.x)/(this.width/this.nbrColor));
    }
    hoverOff(x, y)
    {
        this.hoverSelected = -1;        
    }
}
class ligne extends Interface
{
    constructor(x, y, width, height, nbrColonne)
    {
        super(x, y, width, height);
        this.nbrColonne = nbrColonne;
        this.colonnes = [];
        this.reponse = ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'];
    }
    addColor(color)
    {
        if(this.colonnes.length < this.nbrColonne)
            this.colonnes.push(color);
    }
    emptyResponse()
    {
        let listIndex = [];
        for(let i = 0; i < this.reponse.length; i++)
        {
            if(this.reponse[i] == 'transparent')
                listIndex.push(i);
        }
        let rand = Math.floor(Math.random()*listIndex.length);
        return listIndex[rand];
    }
    addBlanc()
    {
        this.reponse[this.emptyResponse()] = "white";
    }
    addNoir()
    {
        this.reponse[this.emptyResponse()] = "black";
    }
    clean()
    {
        this.colonnes = [];        
    }
    draw()
    {
        this.clearCtx();        
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        let size = this.height/2;
        let w = (this.width-this.height*this.nbrColonne)/2;
        this.drawJeton(w);
        for(let i = 0; i < this.colonnes.length; i++)
        {
            circle(w+this.x+size+(size*2*i), this.y+size, size*0.7, listColors[this.colonnes[i]], listColors[this.colonnes[i]], "2");
        }
    }
    drawJeton(w)
    {
        let s = w/2 < this.height/2 ? w/2 : this.height/2;
        ctx.strokeRect(this.x, this.y, w, this.height);
        ctx.strokeRect(this.x+this.width-w, this.y, w, this.height);

        circle((this.x+w/2)-s, this.y+(this.height/2)-(s/2), s/2-5, this.reponse[0], "black", this.reponse[0] != 'transparent'?"4":"1");
        circle((this.x+w/2)+s, this.y+(this.height/2)-(s/2), s/2-5, this.reponse[1], "black", this.reponse[1] != 'transparent'?"4":"1");
        circle((this.x+w/2)-s, this.y+(this.height/2)+(s/2), s/2-5, this.reponse[2], "black", this.reponse[2] != 'transparent'?"4":"1");
        circle((this.x+w/2)+s, this.y+(this.height/2)+(s/2), s/2-5, this.reponse[3], "black", this.reponse[3] != 'transparent'?"4":"1");

        circle((this.x+this.width-w/2)-s, this.y+(this.height/2)-(s/2), s/2-5, this.reponse[4], "black", this.reponse[4] != 'transparent'?"4":"1");
        circle((this.x+this.width-w/2)+s, this.y+(this.height/2)-(s/2), s/2-5, this.reponse[5], "black", this.reponse[5] != 'transparent'?"4":"1");
        circle((this.x+this.width-w/2)-s, this.y+(this.height/2)+(s/2), s/2-5, this.reponse[6], "black", this.reponse[6] != 'transparent'?"4":"1");
        circle((this.x+this.width-w/2)+s, this.y+(this.height/2)+(s/2), s/2-5, this.reponse[7], "black", this.reponse[7] != 'transparent'?"4":"1");  
    }
}

class Solution extends Interface
{
    constructor(x, y, width, height, colonnes)
    {
        super(x, y, width, height);
        this.colonnes = colonnes;
    }
    draw()
    {
        this.clearCtx();        
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        let size = this.height/2;
        let w = (this.width-this.height*this.colonnes.length)/2;       
        for(let i = 0; i < this.colonnes.length; i++)
        {
            circle(w+this.x+size+(size*2*i), this.y+size, size*0.7, listColors[this.colonnes[i]], listColors[this.colonnes[i]], "2");
        }
    }
}
class Button extends Interface
{
    constructor(x, y, width, height, text, onclick)
    {
        super(x, y, width, height);
        this.text = text;
        this.onclick = onclick;
        this.hover = false;
        this.degre = 1;
    }
    draw()
    {
        this.clearCtx();
        ctx.drawImage(imgButton, this.x, this.y, this.width, this.height);       
        
        if(this.hover)
        {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.save();
            let cx = this.x+this.width-(this.height/2);
            let cy = this.y+(this.height/2);
            ctx.translate(cx, cy);
            ctx.rotate((Math.PI/180)*this.degre);
            ctx.translate(-cx,-cy);
            this.degre = this.degre+20 > 360 ? 1 : this.degre+20;
        }

        ctx.drawImage(imgEngrenage, this.x+this.width-this.height, this.y, this.height, this.height);
        if(this.hover)
            ctx.restore();
        ctx.font = "20px serif";
        ctx.fillStyle = "white";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x+10, this.y+(this.height/2), this.width, this.height);
    }
    click()
    {
        this.onclick();
    }
    hoverOn()
    {
        soundHover.play();        
        this.hover = true;
    }
    hoverOff()
    {
        this.hover = false;
    }
}
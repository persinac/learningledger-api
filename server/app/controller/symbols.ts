import { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import ISymbol from "../structure/Symbol";

class SymbolController {
    public path = "/symbol";
    public router = Router();

    constructor() {
        console.log("symbol constructor");
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getAllSymbols);
        this.router.get(`${this.path}/:id`, this.getSymbolBySymbol);
    }

    private getAllSymbols = (request: Request, response: Response) => {
        const contents = fs.readFileSync("./symbols/symbols.json", "utf8");
        const parsedD: ISymbol[] = JSON.parse(contents);
        console.log(parsedD);
        response.send(parsedD);
    };

    private getSymbolBySymbol = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        console.log(id);
        const contents = fs.readFileSync("./symbols/symbols.json", "utf8");
        const parsedD: ISymbol[] = JSON.parse(contents);
        console.log(contents.substr(0, 1000));
        const found = parsedD.filter((sym: ISymbol) => { return sym.symbol === id.toUpperCase(); } );
        console.log(parsedD.filter((sym: ISymbol) => { return sym.symbol === id.toUpperCase(); } ));
        response.send(found);
    };
}

export default SymbolController;
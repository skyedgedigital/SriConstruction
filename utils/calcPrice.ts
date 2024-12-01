const calcPrice = (quantity:number,price:number,unit:string) => {
    // if(unit === "minutes"){
    //     return quantity*( price / 60.0 );
    // }
    if(unit === "shift"){
        return 1.00 * price;
    }
    else if(unit==="ot"){
        return 0.5 * price * quantity;
    }
    return quantity*price;
}

export {calcPrice}
export default class Complex{
    readonly real: number;
    readonly imag: number;

    constructor(real: number, imag: number) {
        this.real = real;
        this.imag = imag;
    }

    static add(a:Readonly<Complex>,b:Readonly<Complex>) {
        return new Complex(a.real + b.real, a.imag + b.imag);
    }

    static sub(a:Readonly<Complex>,b:Readonly<Complex>) {
        return new Complex(a.real - b.real, a.imag - b.imag);
    }

    static mul(a:Readonly<Complex>,b:Readonly<Complex>) {
        return new Complex(a.real * b.real - a.imag * b.imag, a.imag * b.real + a.real * b.imag);
    }

    static div(a: Readonly<Complex>, b: Readonly<Complex>) {
        const hypot: number = b.real * b.real + b.imag * b.imag;
        return new Complex((a.real * b.real + a.imag * b.imag) / hypot, (a.imag * b.real - a.real * b.imag) / hypot);
    }
}
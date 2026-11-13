"""Calculul pretului unei rezervari.

Deocamdata se calculeaza doar pretul de baza (ore x pret pe ora).
Reducerea de loyalty (5% la fiecare 2 ani de afiliere, maxim 25%) se
adauga in NEED-26, in functia calculate_discount.
"""
from dataclasses import dataclass
from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal


@dataclass
class PriceQuote:
    price: Decimal
    discount: Decimal  # procent, ex. 10 = 10%
    final_price: Decimal


def _money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_discount(affiliation_date: date, on_date: date) -> Decimal:
    """Procentul de reducere. TODO NEED-26: regula de loyalty."""
    return Decimal("0")


def calculate_price(price_per_hour, start_time: datetime, end_time: datetime,
                    affiliation_date: date) -> PriceQuote:
    hours = Decimal((end_time - start_time).total_seconds()) / Decimal(3600)
    price = _money(Decimal(str(price_per_hour)) * hours)
    discount = calculate_discount(affiliation_date, start_time.date())
    final_price = _money(price * (Decimal(100) - discount) / Decimal(100))
    return PriceQuote(price=price, discount=discount, final_price=final_price)

from decimal import Decimal, ROUND_HALF_UP

class FinanceService:
    @staticmethod
    def calculate_gst_invoice(subtotal_val, discount_val=0.0, include_gst=True):
        """Precise monetary GST calculation using Decimal arithmetic"""
        subtotal = Decimal(str(subtotal_val)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        discount = Decimal(str(discount_val)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        taxable_amount = max(Decimal('0.00'), subtotal - discount)

        if include_gst:
            rate_9 = Decimal('0.09')
            cgst = (taxable_amount * rate_9).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            sgst = (taxable_amount * rate_9).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            total_amount = taxable_amount + cgst + sgst
        else:
            cgst = Decimal('0.00')
            sgst = Decimal('0.00')
            total_amount = taxable_amount

        return {
            "subtotal": float(subtotal),
            "discount": float(discount),
            "taxable_amount": float(taxable_amount),
            "include_gst": 1 if include_gst else 0,
            "cgst_rate": 9.0 if include_gst else 0.0,
            "sgst_rate": 9.0 if include_gst else 0.0,
            "cgst_amount": float(cgst),
            "sgst_amount": float(sgst),
            "total_amount": float(total_amount)
        }

    @staticmethod
    def calculate_payment_balance(total_val, paid_val, new_payment_val):
        """Calculates payment balances using Decimal arithmetic"""
        total = Decimal(str(total_val)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        existing_paid = Decimal(str(paid_val)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        payment = Decimal(str(new_payment_val)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        new_total_paid = existing_paid + payment
        new_balance = max(Decimal('0.00'), total - new_total_paid)
        
        if new_balance == Decimal('0.00'):
            status = 'Paid'
        elif new_total_paid > Decimal('0.00'):
            status = 'Partially Paid'
        else:
            status = 'Sent'

        return {
            "paid_amount": float(new_total_paid),
            "balance_amount": float(new_balance),
            "status": status
        }

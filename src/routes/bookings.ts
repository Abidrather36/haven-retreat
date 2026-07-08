import { Router } from 'express';
import { getConnection } from '../db/connection';
import { ROOMS } from '../data/havenData';
import { transporter } from '../utils/mailer';

const router = Router();

// API ROUTE: Get Active Bookings
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.query(
      `SELECT "Id" as id, "RoomId" as "roomId", "RoomTitle" as "roomTitle", 
              "GuestName" as "guestName", "GuestEmail" as "guestEmail", 
              TO_CHAR("CheckIn", 'YYYY-MM-DD') as "checkIn", 
              TO_CHAR("CheckOut", 'YYYY-MM-DD') as "checkOut", 
              "Amount" as amount, "Status" as status, 
              "BookedAt" as "bookedAt" 
       FROM "Bookings"
       ORDER BY "BookedAt" DESC`
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// API ROUTE: Create New Booking
router.post('/', async (req, res) => {
  const { roomId, guestName, guestEmail, checkIn, checkOut, amount } = req.body;

  if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, error: "Missing required booking details." });
  }

  const selectedRoom = ROOMS.find(r => r.id === roomId);
  if (!selectedRoom) {
    return res.status(404).json({ success: false, error: "Selected room sanctuary not found." });
  }

  const bookingId = `booking-${Math.floor(10000 + Math.random() * 90000)}`;
  const finalAmount = amount || selectedRoom.pricePerNight * 2;

  try {
    const pool = await getConnection();
    await pool.query(
      `INSERT INTO "Bookings" ("Id", "RoomId", "RoomTitle", "GuestName", "GuestEmail", "CheckIn", "CheckOut", "Amount")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
       [bookingId, roomId, selectedRoom.title, guestName, guestEmail, checkIn, checkOut, finalAmount]
    );

    const newBooking = {
      id: bookingId,
      roomId,
      roomTitle: selectedRoom.title,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      amount: finalAmount,
      status: "confirmed",
      bookedAt: new Date().toISOString()
    };

    console.log(`New sanctuary booking registered in DB: ${bookingId}`);

    // Email Notification System using Nodemailer
    const totalDue = finalAmount.toLocaleString('en-IN');
    
    if (transporter) {
      try {
        transporter.sendMail({
          from: `"Haven Retreat" <${process.env.GMAIL_USER}>`,
          to: guestEmail,
          subject: 'Sanctuary Confirmed - Haven Retreat',
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #b45309; font-family: serif;">Your sanctuary stay is secured.</h2>
              <p>Dear ${guestName},</p>
              <p>We are delighted to confirm your reservation for <strong>${selectedRoom.title}</strong>.</p>
              <div style="background-color: #f9f9f9; border-left: 4px solid #b45309; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Dates:</strong> ${checkIn} to ${checkOut}</p>
                <p style="margin: 0;"><strong>Total Due at Arrival:</strong> ₹${totalDue}</p>
              </div>
              <p>We look forward to welcoming you to the valley.</p>
              <p>Warm regards,<br>The Haven Retreat Team</p>
            </div>
          `
        }).catch(err => console.error("Failed to send guest email:", err));

        transporter.sendMail({
          from: `"Haven System" <${process.env.GMAIL_USER}>`,
          to: process.env.GMAIL_USER,
          subject: `NEW RESERVATION ALERT - ${bookingId}`,
          html: `
            <div style="font-family: monospace; padding: 20px;">
              <h3>New Stay Logged</h3>
              <p><strong>Guest:</strong> ${guestName} (${guestEmail})</p>
              <p><strong>Room:</strong> ${selectedRoom.title}</p>
              <p><strong>Dates:</strong> ${checkIn} to ${checkOut}</p>
              <p><strong>Amount:</strong> ₹${totalDue}</p>
            </div>
          `
        }).catch(err => console.error("Failed to send admin email:", err));
        
      } catch (error) {
        console.error('Failed to dispatch emails via Gmail:', error);
      }
    } else {
      console.log(`\n=== 📧 EMAIL DISPATCH SYSTEM (SIMULATED) ===`);
      console.log(`[TO: ${guestEmail}] Subject: Sanctuary Confirmed`);
    }

    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    console.error("Create Booking Error:", err);
    res.status(500).json({ success: false, error: 'Failed to create booking in DB' });
  }
});

// API ROUTE: Update Booking Status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

  try {
    const pool = await getConnection();
    await pool.query(`UPDATE "Bookings" SET "Status" = $1 WHERE "Id" = $2`, [status, id]);
    
    const result = await pool.query(
      `SELECT "Id" as id, "RoomId" as "roomId", "RoomTitle" as "roomTitle", 
              "GuestName" as "guestName", "GuestEmail" as "guestEmail", 
              TO_CHAR("CheckIn", 'YYYY-MM-DD') as "checkIn", 
              TO_CHAR("CheckOut", 'YYYY-MM-DD') as "checkOut", 
              "Amount" as amount, "Status" as status, 
              "BookedAt" as "bookedAt" 
       FROM "Bookings" WHERE "Id" = $1`,
       [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Sanctuary booking not found." });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Update Booking Error:", err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// API ROUTE: Delete/Cancel Booking
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    const result = await pool.query(`DELETE FROM "Bookings" WHERE "Id" = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Sanctuary booking not found." });
    }

    res.json({ success: true, message: "Booking removed successfully." });
  } catch (err) {
    console.error("Delete Booking Error:", err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

export default router;

// src/utils/transactions/common.js

// ================== SEEDABLE RANDOM ==================
export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ================== PSYCHOLOGICAL PRICE POINTS ==================
export const PSYCHO = [
  100, 250, 499, 500, 750, 999, 1000, 1500, 1999, 2000, 2500, 2999,
  3000, 3500, 3999, 4000, 4500, 4999, 5000, 7500, 9999, 10000, 15000,
  19999, 20000, 25000, 49999, 50000
];

// ================== INDIAN NAMES & BANKS ==================
export const INDIAN_NAMES = [
  'Ravindra Prajap','Lucky Agrawal','Shivam Joshi','Mohan Gurjar','Mahendra','Muskan S',
  'Seemar','Sudham','Kishan','Seema R','Rohit Vishwaka','Sachin Gurjar','Rupesh Verma',
  'Sanjay Chors','Asha Enterpris','Kashish','Rani','Ritesh Agarwal','Kanhaiya Lal',
  'Satish Choudhr','Rajesh Kumar','Suman Devi','Anil Sharma','Priya Singh','Vikram Patel',
  'Sunita Yadav','Deepak Jain','Neha Gupta','Amitabh Das','Ajay Verma','Pankaj Sharma',
  'Nitin Gupta','Rakesh Yadav','Mukesh Patel','Suresh Kumar','Dinesh Chandra','Manoj Tiwari',
  'Arun Mishra','Vivek Singh','Abhishek Jain','Rahul Agrawal','Harish Meena','Lokesh Saini',
  'Vinod Prajapati','Narendra Rathore','Bhupendra Chauhan','Hemant Solanki','Pradeep Sharma',
  'Yogesh Gupta','Ashok Joshi','Gaurav Bansal','Tarun Sharma','Naveen Verma','Rohit Soni',
  'Kapil Jain','Ravi Mehta','Sandeep Patel','Aakash Sharma','Mayank Gupta','Pooja Sharma',
  'Anjali Verma','Kavita Sharma','Nidhi Gupta','Sneha Jain','Shweta Patel','Komal Agrawal',
  'Payal Sharma','Ritu Verma','Meena Devi','Sakshi Gupta','Anita Yadav','Rekha Sharma',
  'Divya Jain','Pallavi Singh','Aarti Patel','Rashmi Verma','Preeti Sharma','Monika Gupta',
  'Jyoti Yadav','Ramesh Chandra','Mahesh Kumar','Naresh Patel','Omprakash Sharma',
  'Govind Singh','Jagdish Verma','Bharat Meena','Ramlal Gurjar','Shankar Lal','Madan Mohan',
  'Kailash Chand','Brijesh Sharma','Krishna Gopal','Lalit Jain','Tejpal Singh','Harendra Kumar',
  'Rajendra Yadav','Surendra Sharma','Devendra Singh','Umesh Patel','Nandkishore Sharma','Chirag Shah'
];

export const BANKS = ['BKID','BOB','HDFC','SBIN','YESB','IDIB','CNRB','UBIN','AXIS'];

// ================== HOLIDAYS & WORKING DAYS ==================
export const FIXED_HOLIDAYS = new Set([
  '01-26', // Republic Day
  '05-01', // May Day
  '08-15', // Independence Day
  '10-02', // Gandhi Jayanti
  '12-25', // Christmas
]);

export const HOLIDAYS = new Set([
  '2025-03-14','2025-04-11','2025-04-18','2025-05-23','2025-06-02',
  '2025-07-17','2025-08-27','2025-09-16','2025-10-20',
  '2025-11-01','2025-11-15'
]);

export function ymd(d) { return d.toISOString().slice(0, 10); }
export function isHoliday(d) { const k = ymd(d); return HOLIDAYS.has(k) || FIXED_HOLIDAYS.has(k.slice(5)); }
export function isWeekend(d) { const w = d.getUTCDay(); return w === 0 || w === 6; }
export function isWorkingDay(d) { return !isWeekend(d) && !isHoliday(d); }

export function utcDay(v) {
  const d = new Date(v);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function forceWholeRupees(amount) {
  return Math.round(amount / 100) * 100;
}

export function rd(len, rng) {
  let r = '';
  for (let i = 0; i < len; i++) r += Math.floor(rng() * 10);
  return r;
}

export function rl(len, rng) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let r = '';
  for (let i = 0; i < len; i++) r += c.charAt(Math.floor(rng() * c.length));
  return r;
}

export function rname(rng) {
  return INDIAN_NAMES[Math.floor(rng() * INDIAN_NAMES.length)];
}

export function rbank(rng) {
  return BANKS[Math.floor(rng() * BANKS.length)];
}

export function rint(min, max, rng) {
  if (min > max) [min, max] = [max, min];
  return Math.floor(rng() * (max - min + 1)) + min;
}


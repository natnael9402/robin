import { redirect } from 'next/navigation';
import { storage } from '../src/shared/lib/storage';

export default function Home() {
  redirect('/home');
}

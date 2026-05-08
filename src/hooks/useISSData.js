import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { calculateSpeedKmh, getNearestPlace, toNumber } from '../utils/geo';

const ISS_URL = import.meta.env.PROD ? '/api/iss-now' : 'http://api.open-notify.org/iss-now.json';
const PEOPLE_URL = import.meta.env.PROD ? '/api/astros' : 'http://api.open-notify.org/astros.json';
const MAX_TRAJECTORY_POINTS = 15;
const MAX_SPEED_POINTS = 30;

export function useISSData() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [people, setPeople] = useState([]);
  const [peopleCount, setPeopleCount] = useState(0);
  const [nearestPlace, setNearestPlace] = useState('Unknown region');
  const [loading, setLoading] = useState(true);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [error, setError] = useState('');
  const previousPositionRef = useRef(null);

  const fetchPeople = useCallback(async () => {
    setPeopleLoading(true);
    try {
      const { data } = await axios.get(PEOPLE_URL, { timeout: 12000 });
      const allPeople = Array.isArray(data.people) ? data.people : [];
      setPeople(allPeople);
      setPeopleCount(data.number || allPeople.length);
    } catch (requestError) {
      setError('Could not load people currently in space.');
      toast.error('Unable to load people in space.');
    } finally {
      setPeopleLoading(false);
    }
  }, []);

  const fetchISSPosition = useCallback(async ({ silent = false } = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(ISS_URL, { timeout: 12000 });
      const nextPosition = {
        lat: toNumber(data.iss_position?.latitude),
        lng: toNumber(data.iss_position?.longitude),
        timestamp: (data.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      };

      const speed = calculateSpeedKmh(previousPositionRef.current, nextPosition);
      previousPositionRef.current = nextPosition;
      setCurrentPosition({ ...nextPosition, speed });
      setNearestPlace(getNearestPlace(nextPosition.lat, nextPosition.lng));
      setTrajectory((points) => [...points, { ...nextPosition, speed }].slice(-MAX_TRAJECTORY_POINTS));
      setSpeedHistory((points) => [
        ...points,
        {
          speed,
          timestamp: nextPosition.timestamp,
        },
      ].slice(-MAX_SPEED_POINTS));
      setError('');
      if (!silent) toast.success('ISS position refreshed.');
    } catch (requestError) {
      setError('Could not load the latest ISS position.');
      if (!silent) toast.error('Unable to refresh ISS position.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchISSPosition(), fetchPeople()]);
  }, [fetchISSPosition, fetchPeople]);

  useEffect(() => {
    fetchISSPosition({ silent: true });
    fetchPeople();
    const intervalId = window.setInterval(() => fetchISSPosition({ silent: true }), 15000);
    return () => window.clearInterval(intervalId);
  }, [fetchISSPosition, fetchPeople]);

  return {
    currentPosition,
    trajectory,
    speedHistory,
    people,
    peopleCount,
    nearestPlace,
    loading,
    peopleLoading,
    error,
    refreshISS: fetchISSPosition,
    refreshPeople: fetchPeople,
    refreshAll,
    trackedCount: trajectory.length,
  };
}

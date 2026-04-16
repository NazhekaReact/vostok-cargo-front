import {
  ArrowRight,
  Box,
  Calendar,
  CircleDollarSign,
  Maximize2,
  Truck,
  Weight,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/appStyles';

export default function OrderCard({ order, onClick, actionButton }: any) {
  const [expanded, setExpanded] = useState(false);

  const getStatus = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      PUBLISHED: { label: 'Опубликован', bg: '#dbeafe', text: '#2563eb' },
      NEGOTIATION: { label: 'Торг', bg: '#fef3c7', text: '#b45309' },
      ASSIGNED: { label: 'Назначен', bg: '#e5e7eb', text: '#374151' },
      APPROVED: { label: 'Принят', bg: '#dbeafe', text: '#2563eb' },
      AT_PICKUP: { label: 'На погрузке', bg: '#ffedd5', text: '#ea580c' },
      IN_TRANSIT: { label: 'В пути', bg: '#dcfce7', text: '#15803d' },
      AT_DROP: { label: 'На выгрузке', bg: '#e5e7eb', text: '#374151' },
      DELIVERED: { label: 'Завершен', bg: '#f3f4f6', text: '#6b7280' },
    };

    return (
      map[status] || {
        label: status || 'Неизвестно',
        bg: '#f3f4f6',
        text: '#6b7280',
      }
    );
  };

  const statusInfo = getStatus(order?.status);

  const createdAtLabel = useMemo(() => {
    if (!order?.createdAt) return 'Дата не указана';

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return 'Дата не указана';

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  }, [order?.createdAt]);

  const cargoDescription =
    order?.cargoDetails?.description ||
    order?.cargoDetails?.cargoName ||
    order?.cargoDetails?.name ||
    '—';

  const cargoWeight =
    order?.cargoDetails?.weight ??
    order?.cargoDetails?.weightKg ??
    order?.cargoDetails?.mass ??
    0;

  const cargoVolume =
    order?.cargoDetails?.volume ??
    order?.cargoDetails?.volumeM3 ??
    0;

  const price =
    order?.pricing?.customerOffer ??
    order?.pricing?.price ??
    order?.price ??
    null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        if (onClick) onClick();
        else setExpanded(!expanded);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <View style={styles.iconBoxBlue}>
            <Box size={20} color="#3b82f6" />
          </View>

          <View style={styles.ml3}>
            <View style={styles.row}>
              <Text style={styles.cardCityText}>
                {order?.route?.from?.city || 'Не указано'}
              </Text>
              <ArrowRight size={14} color="#9ca3af" style={styles.mx1} />
              <Text style={styles.cardCityText}>
                {order?.route?.to?.city || 'Не указано'}
              </Text>
            </View>

            <View style={[styles.row, styles.mt1]}>
              <Calendar size={12} color="#9ca3af" />
              <Text style={styles.cardDateText}> {createdAtLabel}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {(expanded || actionButton) && (
        <View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Груз</Text>
              <View style={[styles.row, styles.mt1]}>
                <Truck size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}> {cargoDescription}</Text>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Вес</Text>
              <View style={[styles.row, styles.mt1]}>
                <Weight size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}> {cargoWeight} т</Text>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Объем</Text>
              <View style={[styles.row, styles.mt1]}>
                <Maximize2 size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}> {cargoVolume} м³</Text>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Ставка</Text>
              <View style={[styles.row, styles.mt1]}>
                <CircleDollarSign size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}>
                  {' '}
                  {price !== null ? `${price} ₽` : 'Договорная'}
                </Text>
              </View>
            </View>
          </View>

          {cargoDescription !== '—' && (
            <View style={[styles.row, styles.mt3]}>
              <View style={styles.yellowDot} />
              <Text style={styles.descriptionText}>{cargoDescription}</Text>
            </View>
          )}

          {actionButton && <View style={styles.mt4}>{actionButton}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

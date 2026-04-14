import {
  ArrowRight,
  Box,
  Calendar,
  CircleDollarSign,
  Maximize2,
  Truck,
  Weight,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/appStyles';

export default function OrderCard({ order, onClick, actionButton }: any) {
  const [expanded, setExpanded] = useState(false);

  const getStatus = (status: string) => {
    const map: any = {
      PUBLISHED: { label: 'Опубликован', bg: '#dbeafe', text: '#2563eb' },
      NEGOTIATION: { label: 'NEGOTIATION', bg: '#fef3c7', text: '#b45309' },
      ASSIGNED: { label: 'ASSIGNED', bg: '#e5e7eb', text: '#374151' },
      APPROVED: { label: 'Принят', bg: '#dbeafe', text: '#2563eb' },
      IN_TRANSIT: { label: 'IN_TRANSIT', bg: '#dcfce7', text: '#15803d' },
      AT_DROP: { label: 'AT_DROP', bg: '#e5e7eb', text: '#374151' },
      DELIVERED: { label: 'Завершен', bg: '#f3f4f6', text: '#6b7280' },
    };
    return map[status] || {
      label: status || 'Неизвестно',
      bg: '#f3f4f6',
      text: '#6b7280',
    };
  };

  const statusInfo = getStatus(order?.status);

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
              <Text style={styles.cardDateText}> 14 марта</Text>
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
                <Text style={styles.detailsValue}>
                  {' '}
                  {order?.cargoDetails?.description || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Вес</Text>
              <View style={[styles.row, styles.mt1]}>
                <Weight size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}>
                  {' '}
                  {order?.cargoDetails?.weight || 0} т
                </Text>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Объем</Text>
              <View style={[styles.row, styles.mt1]}>
                <Maximize2 size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}>
                  {' '}
                  {order?.cargoDetails?.volume || 0} м³
                </Text>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.detailsLabel}>Ставка</Text>
              <View style={[styles.row, styles.mt1]}>
                <CircleDollarSign size={14} color="#60a5fa" />
                <Text style={styles.detailsValue}>
                  {' '}
                  {order?.pricing?.customerOffer
                    ? `${order.pricing.customerOffer} ₽`
                    : 'Договорная'}
                </Text>
              </View>
            </View>
          </View>

          {order?.cargoDetails?.description && (
            <View style={[styles.row, styles.mt3]}>
              <View style={styles.yellowDot} />
              <Text style={styles.descriptionText}>
                {order.cargoDetails.description}
              </Text>
            </View>
          )}

          {actionButton && <View style={styles.mt4}>{actionButton}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}
